import { type contract } from "@stellar/stellar-sdk"
import { errorMessage } from "@stellar-scaffold/app-lib"
import { type etiqueta, type peaje } from "@stellar-scaffold/app-lib/clients"
import { type Signer } from "./config"

export type Charge = Awaited<
	ReturnType<typeof peaje.get_charges>
>["result"][number]
export type Bono = Awaited<ReturnType<typeof peaje.balance>>["result"]
export type Zone = NonNullable<
	Awaited<ReturnType<typeof peaje.get_zone>>["result"]
>
export type Label = NonNullable<
	Awaited<ReturnType<typeof etiqueta.get>>["result"]
>
export type ChargeStatus = Charge["status"]["tag"]

/** Errores de los contratos, en el idioma de la web */
const ERRORS: Record<string, string> = {
	NotConfigured:
		"The toll is not linked to the label contract: run scripts/zbe-setup.sh",
	ZoneNotFound: "This zone does not exist",
	NotCamera: "This account is not an authorized camera",
	InvalidAmount: "Invalid amount",
	InsufficientFree: "Not enough available balance",
	ChargeNotFound: "Charge not found",
	NotChargeOwner: "This charge is not yours",
	NotPending: "This charge is no longer pending",
	AppealWindowClosed: "The appeal window has closed",
	AppealWindowOpen: "The appeal window is still open",
	ChargeDisputed: "Charge under dispute: only the arbiter can close it",
	NotDisputed: "This charge is not under dispute",
	AlreadyIssued: "This plate already has a label",
	NotFound: "This plate has no label",
}

export const friendlyError = (e: unknown): string => {
	const msg = errorMessage(e)
	return ERRORS[msg] ?? msg
}

interface ResultLike {
	isErr: () => boolean
	unwrap: () => unknown
	unwrapErr: () => { message: string }
}

const isResult = (v: unknown): v is ResultLike =>
	typeof v === "object" &&
	v !== null &&
	typeof (v as Partial<ResultLike>).isErr === "function"

/** Tipo de éxito de un `Result` del contrato, o el propio tipo si no lo es */
type Unwrap<T> = T extends { unwrap: () => infer U } ? U : T

const unwrap = <T>(v: T): Unwrap<T> => {
	if (!isResult(v)) return v as Unwrap<T>
	if (v.isErr())
		throw new Error(ERRORS[v.unwrapErr().message] ?? v.unwrapErr().message)
	return v.unwrap() as Unwrap<T>
}

/**
 * Firma y envía una transacción de un cliente generado. Si la simulación ya
 * devuelve un error del contrato, falla antes de pedir la firma.
 */
export const send = async <T>(
	tx: contract.AssembledTransaction<T>,
	signer: Signer,
) => {
	unwrap(tx.result)
	const sent = await tx.signAndSend({
		signTransaction: signer.signTransaction,
	})
	return unwrap(sent.result)
}

/** Opciones para que la transacción la pague y firme `signer` */
export const as = (signer: Signer) => ({ publicKey: signer.address })

export const isOpen = (charge: Charge, nowSecs: number) =>
	nowSecs < Number(charge.deadline)

export const secondsLeft = (charge: Charge, nowSecs: number) =>
	Math.max(0, Number(charge.deadline) - nowSecs)
