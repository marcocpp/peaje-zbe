import { Keypair, contract } from "@stellar/stellar-sdk"
import { networkPassphrase } from "@stellar-scaffold/app-lib"

/** Zona de la demo (CLAUDE.md): solo Cero y Eco, 5 USDC/día, 60 s para alegar */
export const ZONE = "centro"

/** El token tiene 7 decimales */
export const UNIT = 10_000_000n

export const CATEGORIES = [
	{ value: 0, name: "Sin etiqueta", color: "#6c757d" },
	{ value: 1, name: "B", color: "#e0a800" },
	{ value: 2, name: "C", color: "#2e9e4f" },
	{ value: 3, name: "Eco", color: "#1f7ae0" },
	{ value: 4, name: "Cero", color: "#0b5cad" },
] as const

export const categoryName = (value: number) =>
	CATEGORIES[value]?.name ?? `?${value}`

export const formatUsdc = (amount: bigint) => {
	const whole = amount / UNIT
	const cents = (amount % UNIT) / 100_000n
	return `${whole}${cents ? `,${cents.toString().padStart(2, "0")}` : ""} USDC`
}

export const parseUsdc = (text: string): bigint => {
	const [whole = "0", frac = ""] = text.replace(",", ".").split(".")
	return BigInt(whole || "0") * UNIT + BigInt(frac.padEnd(7, "0").slice(0, 7))
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
	me: "DGT / Ayuntamiento",
	camara: "Cámara",
	arbitro: "Árbitro",
	tesoreria: "Tesorería",
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
			`Falta la clave de "${name}": ejecuta scripts/zbe-env.sh y recarga`,
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
