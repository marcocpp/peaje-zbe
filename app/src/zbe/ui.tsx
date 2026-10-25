import {
	ArrowCounterClockwise,
	CheckCircle,
	LockSimple,
	Scales,
	Signature,
	Timer,
	WarningCircle,
} from "@phosphor-icons/react"
import { shortAddress } from "@stellar-scaffold/app-lib"
import { type ReactNode } from "react"
import { accountName, categoryName, formatUsdc } from "./config"
import { type Charge, type ChargeStatus, secondsLeft } from "./contracts"
import { useLabels } from "./hooks"

/** Texto de cada distintivo tal y como aparece en la pegatina de la DGT */
const STICKER = ["–", "B", "C", "ECO", "0"]

/** Distintivo ambiental dibujado como la pegatina redonda de la DGT */
export const CategoryBadge = ({
	value,
	withName,
}: {
	value: number
	withName?: boolean
}) => (
	<span className="zbe-category">
		<span
			className={`zbe-sticker zbe-sticker--${value}`}
			role="img"
			aria-label={`Environmental label: ${categoryName(value)}`}
			title={`Environmental label: ${categoryName(value)}`}
		>
			{STICKER[value] ?? "?"}
		</span>
		{/* El nombre solo si la pegatina no lo dice ya (B, C, ECO) */}
		{withName && categoryName(value).toUpperCase() !== STICKER[value] && (
			<span>{categoryName(value)}</span>
		)}
	</span>
)

const STATUS: Record<
	ChargeStatus,
	{ text: string; cls: string; Icon: typeof LockSimple }
> = {
	Pending: { text: "Locked", cls: "pending", Icon: LockSimple },
	Disputed: { text: "Under appeal", cls: "disputed", Icon: Scales },
	Settled: { text: "Collected", cls: "settled", Icon: CheckCircle },
	Cancelled: {
		text: "Cancelled",
		cls: "cancelled",
		Icon: ArrowCounterClockwise,
	},
}

export const StatusBadge = ({ status }: { status: ChargeStatus }) => {
	const { text, cls, Icon } = STATUS[status]
	return (
		<span className={`zbe-status zbe-status--${cls}`}>
			<Icon weight="bold" aria-hidden />
			{text}
		</span>
	)
}

/** Cuenta atrás de la ventana de alegación de un cargo pendiente */
export const Countdown = ({ charge, now }: { charge: Charge; now: number }) => {
	if (charge.status.tag !== "Pending") return null
	const left = secondsLeft(charge, now)
	if (left === 0) return <span className="zbe-muted">Window closed</span>
	const m = Math.floor(left / 60)
	const s = left % 60
	return (
		<span className="zbe-countdown">
			<Timer weight="bold" aria-hidden />
			{m > 0 ? `${m}m ` : ""}
			{s}s left to appeal
		</span>
	)
}

/**
 * Matrícula con formato europeo. Si este navegador no la conoce llega el hash
 * abreviado ("8f6ed30…"), y se muestra como tal, no como una matrícula
 */
export const Plate = ({ plate }: { plate: string }) =>
	plate.endsWith("…") ? (
		<code
			className="zbe-hash"
			title="Plate unknown in this browser: only its HMAC is on-chain"
		>
			{plate}
		</code>
	) : (
		<span className="zbe-plate">
			<span className="zbe-plate-eu" aria-hidden>
				E
			</span>
			<span className="zbe-plate-text">{plate}</span>
		</span>
	)

export const Who = ({ address }: { address: string }) => {
	const name = accountName(address)
	return (
		<span title={address}>
			{name ?? shortAddress(address)}
			{name && <span className="zbe-muted"> – {shortAddress(address)}</span>}
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

/** Una cifra de un panel: etiqueta arriba, valor grande debajo */
export const Stat = ({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) => (
	<div className="zbe-stat">
		<dt>{label}</dt>
		<dd>{children}</dd>
	</div>
)

/** Cabecera de cada vista: título, qué se hace aquí y quién firma */
export const PageHead = ({
	title,
	children,
	signer,
}: {
	title: string
	children?: ReactNode
	signer?: string
}) => (
	<header className="zbe-page-head">
		<div>
			<h1>{title}</h1>
			{children && <p>{children}</p>}
		</div>
		{signer && (
			<span className="zbe-chip">
				<Signature weight="bold" aria-hidden />
				Signing as <strong>{signer}</strong>
			</span>
		)}
	</header>
)

/** Aviso cuando faltan las claves de demo en app/.env.local */
export const MissingKeys = ({ who }: { who: string }) => (
	<div className="zbe-notice" role="alert">
		<WarningCircle weight="bold" aria-hidden />
		<p>
			The demo key for <strong>{who}</strong> is missing. Run{" "}
			<code>scripts/zbe-setup.sh</code> (or <code>scripts/zbe-env.sh</code>) and
			reload the page.
		</p>
	</div>
)

/** Señal de zona de bajas emisiones: anillo rojo con "ZBE" */
export const ZbeSign = ({ size = 40 }: { size?: number }) => (
	<svg
		className="zbe-sign"
		width={size}
		height={size}
		viewBox="0 0 40 40"
		role="img"
		aria-label="Low Emission Zone sign"
	>
		<circle
			cx="20"
			cy="20"
			r="17"
			fill="#fff"
			stroke="#C8102E"
			strokeWidth="5"
		/>
		<text
			x="20"
			y="24.2"
			textAnchor="middle"
			fontSize="11.5"
			fontWeight="800"
			fill="#10151C"
			fontFamily="inherit"
		>
			ZBE
		</text>
	</svg>
)

/**
 * Señal de resultado de una lectura de cámara: disco azul con check (entra
 * gratis), anillo rojo con candado (cargo bloqueado) o anillo gris (sin bono,
 * no se cobra nada)
 */
export const OutcomeSign = ({ kind }: { kind: "ok" | "charge" | "nobono" }) => (
	<svg
		className="zbe-outcome-sign"
		width="44"
		height="44"
		viewBox="0 0 44 44"
		aria-hidden
	>
		{kind === "ok" && (
			<>
				<circle cx="22" cy="22" r="20" fill="#0B4EA2" />
				<path
					d="M13 22.5l6 6 12-13"
					fill="none"
					stroke="#fff"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</>
		)}
		{kind === "charge" && (
			<>
				<circle
					cx="22"
					cy="22"
					r="18"
					fill="#fff"
					stroke="#C8102E"
					strokeWidth="5"
				/>
				<rect x="15" y="20" width="14" height="10" rx="2" fill="#10151C" />
				<path
					d="M17.5 20v-3a4.5 4.5 0 0 1 9 0v3"
					fill="none"
					stroke="#10151C"
					strokeWidth="2.5"
				/>
			</>
		)}
		{kind === "nobono" && (
			<>
				<circle
					cx="22"
					cy="22"
					r="18"
					fill="#fff"
					stroke="#8994A3"
					strokeWidth="5"
				/>
				<path
					d="M15 22h14"
					stroke="#4A5563"
					strokeWidth="3.5"
					strokeLinecap="round"
				/>
			</>
		)}
	</svg>
)
