import { Keypair, contract } from "@stellar/stellar-sdk"
import { networkPassphrase } from "@stellar-scaffold/app-lib"

/** Zona de la demo (CLAUDE.md): solo Cero y Eco, 5 USDC/día, 60 s para alegar */
export const ZONE = "centro"

/** El token tiene 7 decimales */
export const UNIT = 10_000_000n

/** Distintivos de la DGT; los colores de las pegatinas están en zbe.css */
export const CATEGORIES = [
	{ value: 0, name: "No label" },
	{ value: 1, name: "B" },
	{ value: 2, name: "C" },
	{ value: 3, name: "Eco" },
	{ value: 4, name: "Zero" },
] as const

export const categoryName = (value: number) =>
	CATEGORIES[value]?.name ?? `?${value}`

export const formatUsdc = (amount: bigint) => {
	const whole = amount / UNIT
	const cents = (amount % UNIT) / 100_000n
	return `${whole}${cents ? `.${cents.toString().padStart(2, "0")}` : ""} USDC`
}

/** Importe positivo con hasta 7 decimales; lanza un error legible si no */
export const parseUsdc = (text: string): bigint => {
	const match = /^\s*(\d*)(?:[.,](\d{0,7}))?\s*$/.exec(text)
	const whole = match?.[1] ?? ""
	const frac = match?.[2] ?? ""
	const amount = match
		? BigInt(whole || "0") * UNIT + BigInt(frac.padEnd(7, "0"))
		: 0n
	if (amount <= 0n) {
		throw new Error("Enter a positive amount (up to 7 decimals)")
	}
	return amount
}

/** Firma de transacciones: la wallet conectada o una cuenta de demo */
export type SignTransaction = (
	xdr: string,
	opts?: { networkPassphrase?: string; address?: string },
) => Promise<{ signedTxXdr: string; signerAddress?: string }>

export interface Signer {
	address: string
	label: string
	signTransaction: SignTransaction
}

/**
 * Cuentas de demo con clave secreta en app/.env.local (scripts/zbe-env.sh).
 * Solo para la demo: así una sola persona puede actuar como cámara,
 * ayuntamiento y árbitro sin cambiar de wallet.
 */
const DEMO_ACCOUNTS = {
	me: "DGT / City Hall",
	camara: "Camera",
	arbitro: "Arbiter",
	tesoreria: "Treasury",
	lucia: "Lucía",
	pablo: "Pablo",
	ana: "Ana",
} as const

export type DemoName = keyof typeof DEMO_ACCOUNTS

const secrets: Record<DemoName, string | undefined> = {
	me: import.meta.env.PUBLIC_ZBE_SECRET_ME,
	camara: import.meta.env.PUBLIC_ZBE_SECRET_CAMARA,
	arbitro: import.meta.env.PUBLIC_ZBE_SECRET_ARBITRO,
	tesoreria: import.meta.env.PUBLIC_ZBE_SECRET_TESORERIA,
	lucia: import.meta.env.PUBLIC_ZBE_SECRET_LUCIA,
	pablo: import.meta.env.PUBLIC_ZBE_SECRET_PABLO,
	ana: import.meta.env.PUBLIC_ZBE_SECRET_ANA,
}

const cache = new Map<DemoName, Signer>()

/** `undefined` si falta la clave (no se ha ejecutado scripts/zbe-env.sh) */
export const demoSigner = (name: DemoName): Signer | undefined => {
	const secret = secrets[name]
	if (!secret) return undefined
	let signer = cache.get(name)
	if (!signer) {
		const keypair = Keypair.fromSecret(secret)
		const { signTransaction } = contract.basicNodeSigner(
			keypair,
			networkPassphrase,
		)
		signer = {
			address: keypair.publicKey(),
			label: DEMO_ACCOUNTS[name],
			signTransaction,
		}
		cache.set(name, signer)
	}
	return signer
}

export const requireDemoSigner = (name: DemoName): Signer => {
	const signer = demoSigner(name)
	if (!signer) {
		throw new Error(
			`Missing demo key for "${name}": run scripts/zbe-env.sh and reload`,
		)
	}
	return signer
}

/** Nombre legible de una dirección si es una cuenta de demo */
export const accountName = (address: string): string | undefined => {
	for (const name of Object.keys(DEMO_ACCOUNTS) as DemoName[]) {
		if (demoSigner(name)?.address === address) return DEMO_ACCOUNTS[name]
	}
	return undefined
}

export const DEMO_DRIVERS: DemoName[] = ["lucia", "pablo", "ana"]
