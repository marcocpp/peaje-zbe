import { type CSSProperties, type ReactNode } from "react"
import { spring, useCurrentFrame, useVideoConfig } from "remotion"
import { general } from "../contenido"
import { color, fuente, muelle, radio, resplandor } from "../tema"
import { ICONOS } from "./Iconos"

/** Tarjeta gris oscuro con borde fino */
export const Tarjeta = ({
	children,
	style,
	activa = false,
}: {
	children: ReactNode
	style?: CSSProperties
	activa?: boolean
}) => (
	<div
		style={{
			background: `linear-gradient(180deg, ${color.tarjetaAlta}, ${color.tarjeta})`,
			border: `1px solid ${activa ? color.acentoBorde : color.borde}`,
			borderRadius: radio.l,
			boxShadow: activa ? resplandor(0.45) : "0 20px 50px rgba(0,0,0,0.45)",
			color: color.texto,
			fontFamily: fuente.sans,
			...style,
		}}
	>
		{children}
	</div>
)

/** Entrada con spring: sube y aparece a partir de `retraso` */
export const Aparece = ({
	retraso = 0,
	children,
	desde = 30,
	style,
}: {
	retraso?: number
	children: ReactNode
	desde?: number
	style?: CSSProperties
}) => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()
	const p = spring({ frame: frame - retraso, fps, config: muelle.entrada })
	return (
		<div
			style={{
				opacity: Math.min(1, p * 1.4),
				transform: `translateY(${(1 - p) * desde}px)`,
				...style,
			}}
		>
			{children}
		</div>
	)
}

/** Pegatina torcida con icono */
export const Etiqueta = ({
	texto,
	icono,
	giro = -4,
	retraso = 0,
}: {
	texto: string
	icono: keyof typeof ICONOS
	giro?: number
	retraso?: number
}) => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()
	const p = spring({ frame: frame - retraso, fps, config: muelle.pegatina })
	const Icono = ICONOS[icono]
	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 14,
				padding: "16px 28px 16px 20px",
				background: color.acento,
				color: "#04130a",
				borderRadius: 999,
				fontFamily: fuente.sans,
				fontWeight: 800,
				fontSize: 34,
				letterSpacing: "-0.01em",
				boxShadow: `${resplandor(0.6)}, 0 10px 24px rgba(0,0,0,0.5)`,
				transform: `rotate(${giro * p}deg) scale(${p})`,
				opacity: Math.min(1, p * 2),
			}}
		>
			<span
				style={{
					display: "grid",
					placeItems: "center",
					width: 44,
					height: 44,
					borderRadius: 999,
					background: "#04130a",
				}}
			>
				<Icono tam={26} color={color.acento} grosor={2.2} />
			</span>
			{texto}
		</div>
	)
}

/** Píldora pequeña (chips de herramientas, rol, categoría) */
export const Chip = ({
	children,
	acento = false,
	style,
}: {
	children: ReactNode
	acento?: boolean
	style?: CSSProperties
}) => (
	<span
		style={{
			display: "inline-flex",
			alignItems: "center",
			gap: 10,
			padding: "8px 18px",
			borderRadius: 999,
			border: `1px solid ${acento ? color.acentoBorde : color.bordeFuerte}`,
			background: acento ? color.acentoSuave : "rgba(255,255,255,0.03)",
			color: acento ? color.acento : color.textoSuave,
			fontFamily: fuente.sans,
			fontWeight: 600,
			fontSize: 22,
			whiteSpace: "nowrap",
			...style,
		}}
	>
		{children}
	</span>
)

export const Punto = ({
	c = color.acento,
	tam = 10,
}: {
	c?: string
	tam?: number
}) => (
	<span
		style={{
			width: tam,
			height: tam,
			borderRadius: 99,
			background: c,
			boxShadow: `0 0 10px ${c}`,
		}}
	/>
)

/** Etiqueta discreta de prototipo en testnet, visible todo el vídeo */
export const MarcaPrototipo = () => (
	<div
		style={{
			position: "absolute",
			top: 20,
			left: 28,
			display: "flex",
			alignItems: "center",
			gap: 10,
			fontFamily: fuente.sans,
			fontSize: 18,
			fontWeight: 600,
			color: color.textoSuave,
			opacity: 0.85,
			letterSpacing: "0.02em",
		}}
	>
		<Punto tam={8} />
		{general.marcaPrototipo}
	</div>
)
