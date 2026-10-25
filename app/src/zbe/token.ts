// El token del bono es un Stellar Asset Contract (USDC:emisor). No tiene
// cliente generado, así que se llama a mano con la SDK.
import {
	Address,
	Asset,
	BASE_FEE,
	Contract,
	Operation,
	TransactionBuilder,
	nativeToScVal,
	rpc,
	scValToNative,
	type xdr,
} from "@stellar/stellar-sdk"
import { allowHttp, networkPassphrase, rpcUrl } from "@stellar-scaffold/app-lib"
import { peaje } from "@stellar-scaffold/app-lib/clients"
import { type Signer } from "./config"

const server = new rpc.Server(rpcUrl, { allowHttp })

let tokenId: Promise<string> | undefined
export const usdcContractId = () =>
	(tokenId ??= peaje.get_config().then((r) => r.result.token))

/** Simula una llamada de solo lectura al token */
const read = async (
	source: string,
	method: string,
	...args: xdr.ScVal[]
): Promise<unknown> => {
	const account = await server.getAccount(source)
	const tx = new TransactionBuilder(account, {
		fee: BASE_FEE,
		networkPassphrase,
	})
		.addOperation(new Contract(await usdcContractId()).call(method, ...args))
		.setTimeout(30)
		.build()
	const sim = await server.simulateTransaction(tx)
	if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
		throw new Error(`USDC.${method} failed`)
	}
	return scValToNative(sim.result.retval)
}

/** Asset clásico USDC:emisor, leído del propio contrato */
export const usdcAsset = async (source: string): Promise<Asset> => {
	const name = (await read(source, "name")) as string
	const [code = "USDC", issuer = ""] = name.split(":")
	return new Asset(code, issuer)
}

/** Saldo en la cartera (no en el bono). `null` si no hay trustline */
export const usdcBalance = async (address: string): Promise<bigint | null> => {
	try {
		return BigInt(
			(await read(
				address,
				"balance",
				Address.fromString(address).toScVal(),
			)) as bigint,
		)
	} catch {
		return null
	}
}

const submit = async (
	tx: ReturnType<TransactionBuilder["build"]>,
	signer: Signer,
) => {
	const { signedTxXdr } = await signer.signTransaction(tx.toXDR(), {
		networkPassphrase,
		address: signer.address,
	})
	const signed = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase)
	const sent = await server.sendTransaction(signed)
	if (sent.status === "ERROR") throw new Error("Transaction rejected")
	const done = await server.pollTransaction(sent.hash)
	if (done.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
		throw new Error(`Transaction failed (${done.status})`)
	}
}

/** Crea la trustline a USDC para que una cuenta G pueda recibirlo */
export const addTrustline = async (signer: Signer) => {
	const asset = await usdcAsset(signer.address)
	const account = await server.getAccount(signer.address)
	const tx = new TransactionBuilder(account, {
		fee: BASE_FEE,
		networkPassphrase,
	})
		.addOperation(Operation.changeTrust({ asset }))
		.setTimeout(60)
		.build()
	await submit(tx, signer)
}

/** Emite USDC de prueba. `issuer` es la cuenta emisora (me) */
export const mintUsdc = async (issuer: Signer, to: string, amount: bigint) => {
	const account = await server.getAccount(issuer.address)
	const tx = new TransactionBuilder(account, {
		fee: BASE_FEE,
		networkPassphrase,
	})
		.addOperation(
			new Contract(await usdcContractId()).call(
				"mint",
				Address.fromString(to).toScVal(),
				nativeToScVal(amount, { type: "i128" }),
			),
		)
		.setTimeout(60)
		.build()
	await submit(await server.prepareTransaction(tx), issuer)
}
