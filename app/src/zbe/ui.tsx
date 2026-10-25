import { shortAddress } from "@stellar-scaffold/app-lib"
import { type ReactNode } from "react"
import { accountName, categoryName, CATEGORIES, formatUsdc } from "./config"
import { type Charge, type ChargeStatus, secondsLeft } from "./contracts"
import { useLabels } from "./hooks"
import "./zbe.css"

export const CategoryBadge = ({ value }: { value: number }) => (
	<span
		className="zbe-category"
		style={{ background: CATEGORIES[value]?.color ?? "#999" }}
		title={`Etiqueta ${categoryName(value)}`}
	>
		{categoryName(value)}
	</span>
)

const STATUS: Record<ChargeStatus, { text: string; cls: string }> = {
	Pending: { text: "Bloqueado", cls: "pending" },
	Disputed: { text: "En disputa", cls: "disputed" },
	Settled: { text: "Cobrado", cls: "settled" },
	Cancelled: { text: "Anulado", cls: "cancelled" },
}

export const StatusBadge = ({ status }: { status: ChargeStatus }) => (
	<span className={`zbe-status zbe-status--${STATUS[status].cls}`}>
		{STATUS[status].text}
	</span>
)

/** Cuenta atrás de la ventana de alegación de un cargo pendiente */
export const Countdown = ({ charge, now }: { charge: Charge; now: number }) => {
	if (charge.status.tag !== "Pending") return null
	const left = secondsLeft(charge, now)
	if (left === 0) return <span className="zbe-muted">Plazo vencido</span>
	const m = Math.floor(left / 60)
	const s = left % 60
	return (
		<span className="zbe-countdown">
			⏱ {m > 0 ? `${m} min ` : ""}
			{s} s para alegar
		</span>
	)
}

export const Who = ({ address }: { address: string }) => {
	const name = accountName(address)
	return (
		<span title={address}>
			{name ?? shortAddress(address)}
			{name && <span className="zbe-muted"> · {shortAddress(address)}</span>}
		</span>
	)
}

export const Usdc = ({ amount }: { amount?: bigint | null }) => (
	<span className="zbe-amount">
		{amount === undefined ? "…" : amount === null ? "—" : formatUsdc(amount)}
	</span>
)

/** Matrícula en claro si este navegador la conoce; si no, el hash abreviado */
export const usePlateLookup = () => {
	const { data } = useLabels()
	return (hash: string) =>
		data?.find((p) => p.hash === hash)?.plate ?? `${hash.slice(0, 8)}…`
}

export const Stat = ({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) => (
	<div className="card zbe-stat">
		<div className="zbe-muted">{label}</div>
		<div className="zbe-stat-value">{children}</div>
	</div>
)

export const PageTitle = ({
	title,
	children,
}: {
	title: string
	children?: ReactNode
}) => (
	<div className="zbe-title">
		<h1>{title}</h1>
		{children && <p className="zbe-muted">{children}</p>}
	</div>
)

/** Aviso cuando faltan las claves de demo en app/.env.local */
export const MissingKeys = ({ who }: { who: string }) => (
	<div className="card zbe-warning" role="alert">
		Falta la clave de demo de <strong>{who}</strong>. Ejecuta{" "}
		<code>scripts/zbe-setup.sh</code> (o <code>scripts/zbe-env.sh</code>) y
		recarga la página.
	</div>
)
