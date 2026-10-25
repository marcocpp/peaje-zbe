import { shortAddress } from "@stellar-scaffold/app-lib"
import { type ReactNode } from "react"
import { accountName, categoryName, CATEGORIES, formatUsdc } from "./config"
import { type Charge, type ChargeStatus, secondsLeft } from "./contracts"
import { useLabels } from "./hooks"

export const CategoryBadge = ({ value }: { value: number }) => (
	<span
		className="zbe-category"
		style={{ background: CATEGORIES[value]?.color ?? "#999" }}
		title={`Environmental label: ${categoryName(value)}`}
	>
		{categoryName(value)}
	</span>
)

const STATUS: Record<ChargeStatus, { text: string; cls: string }> = {
	Pending: { text: "Locked", cls: "pending" },
	Disputed: { text: "Under appeal", cls: "disputed" },
	Settled: { text: "Collected", cls: "settled" },
	Cancelled: { text: "Cancelled", cls: "cancelled" },
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
	if (left === 0) return <span className="zbe-muted">Window closed</span>
	const m = Math.floor(left / 60)
	const s = left % 60
	return (
		<span className="zbe-countdown">
			⏱ {m > 0 ? `${m}m ` : ""}
			{s}s left to appeal
		</span>
	)
}

/** Matrícula con formato europeo */
export const Plate = ({ plate }: { plate: string }) => (
	<span className="zbe-plate">
		<span className="zbe-plate-eu">E</span>
		<span className="zbe-plate-text">{plate}</span>
	</span>
)

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
		data?.find((p) => p.hash === hash)?.plate ?? `${hash.slice(0, 7)}…`
}

export const Stat = ({
	label,
	children,
	accent,
}: {
	label: string
	children: ReactNode
	accent?: boolean
}) => (
	<div className={`card zbe-stat${accent ? " zbe-stat--accent" : ""}`}>
		<div className="zbe-stat-label">{label}</div>
		<div className="zbe-stat-value">{children}</div>
	</div>
)

/** Cabecera de cada vista: icono, título, descripción y quién firma */
export const PageHead = ({
	icon,
	title,
	children,
	signer,
}: {
	icon: string
	title: string
	children?: ReactNode
	signer?: string
}) => (
	<div className="zbe-page-head">
		<div className="zbe-page-icon" aria-hidden>
			{icon}
		</div>
		<div>
			<h1>{title}</h1>
			{children && <p>{children}</p>}
		</div>
		{signer && (
			<span className="zbe-chip">
				✍️ Signing as <strong>{signer}</strong>
			</span>
		)}
	</div>
)

/** Aviso cuando faltan las claves de demo en app/.env.local */
export const MissingKeys = ({ who }: { who: string }) => (
	<div className="card zbe-warning" role="alert">
		The demo key for <strong>{who}</strong> is missing. Run{" "}
		<code>scripts/zbe-setup.sh</code> (or <code>scripts/zbe-env.sh</code>) and
		reload the page.
	</div>
)
