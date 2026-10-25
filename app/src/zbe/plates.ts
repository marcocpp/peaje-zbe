import { Buffer } from "buffer"

const HMAC_KEY = import.meta.env.PUBLIC_ZBE_HMAC_KEY ?? "zbe-demo-key"

/** Matrículas fijas de la demo (las mismas que scripts/zbe-common.sh) */
export const DEMO_PLATES = [
	{ plate: "1111BCD", note: "Ana – Eco" },
	{ plate: "2222BCD", note: "Lucía – B, has a pass" },
	{ plate: "3333BCD", note: "Pablo – B, no pass" },
]

const STORAGE_KEY = "zbe-plates"

export const normalizePlate = (plate: string) =>
	plate.toUpperCase().replace(/[^0-9A-Z]/g, "")

/**
 * plate_hash = HMAC-SHA256(clave, matrícula). En la cadena nunca va la
 * matrícula en claro. En un sistema real la clave la custodian las cámaras.
 */
const enc = new TextEncoder()
let hmacKey: Promise<CryptoKey> | undefined
const hashes = new Map<string, Promise<Buffer>>()

export const plateHash = (plate: string): Promise<Buffer> => {
	// El panel recalcula los hashes cada 3 s: se guardan por matrícula
	const p = normalizePlate(plate)
	let hash = hashes.get(p)
	if (!hash) {
		hmacKey ??= crypto.subtle.importKey(
			"raw",
			enc.encode(HMAC_KEY),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		)
		hash = hmacKey
			.then((key) => crypto.subtle.sign("HMAC", key, enc.encode(p)))
			.then((sig) => Buffer.from(sig))
		hashes.set(p, hash)
	}
	return hash
}

/** Matrículas que emitió la DGT desde este navegador, además de las de demo */
export const knownPlates = (): { plate: string; note: string }[] => {
	let extra: string[] = []
	try {
		extra = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]
	} catch {
		// sin almacenamiento: solo las de demo
	}
	const demo = new Set(DEMO_PLATES.map((p) => p.plate))
	return [
		...DEMO_PLATES,
		...extra
			.filter((p) => !demo.has(p))
			.map((plate) => ({ plate, note: "Issued in this demo" })),
	]
}

export const rememberPlate = (plate: string) => {
	try {
		const list = JSON.parse(
			localStorage.getItem(STORAGE_KEY) ?? "[]",
		) as string[]
		const p = normalizePlate(plate)
		if (!list.includes(p)) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, p]))
		}
	} catch {
		// sin almacenamiento: no pasa nada
	}
}
