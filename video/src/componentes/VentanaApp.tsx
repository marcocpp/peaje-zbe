import { type ReactNode } from "react"
import {
	Easing,
	Img,
	interpolate,
	OffthreadVideo,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from "remotion"
import { type Paso } from "../contenido"
import { color, fuente, muelle, resplandor, ventana } from "../tema"

/** Marco de ventana con tres puntos, título y dirección */
export const VentanaApp = ({
	titulo,
	direccion,
	children,
}: {
	titulo: string
	direccion: string
	children: ReactNode
}) => (
	<div
		style={{
			position: "absolute",
			left: ventana.x,
			top: ventana.y,
			width: ventana.ancho,
			borderRadius: 16,
			overflow: "hidden",
			border: `1px solid ${color.bordeFuerte}`,
			background: color.tarjeta,
			boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(61,255,143,0.06)",
		}}
	>
		<div
			style={{
				height: ventana.barra,
				display: "flex",
				alignItems: "center",
				gap: 18,
				padding: "0 18px",
				background: color.tarjetaAlta,
				borderBottom: `1px solid ${color.borde}`,
				fontFamily: fuente.sans,
			}}
		>
			<div style={{ display: "flex", gap: 8 }}>
				{["#ff5f57", "#febc2e", "#28c840"].map((c) => (
					<span
						key={c}
						style={{
							width: 13,
							height: 13,
							borderRadius: 99,
							background: c,
							opacity: 0.85,
						}}
					/>
				))}
			</div>
			<span style={{ color: color.texto, fontWeight: 600, fontSize: 18 }}>
				{titulo}
			</span>
			<span
				style={{
					marginLeft: "auto",
					marginRight: "auto",
					transform: "translateX(-60px)",
					padding: "5px 18px",
					borderRadius: 8,
					background: "rgba(255,255,255,0.04)",
					border: `1px solid ${color.borde}`,
					color: color.textoSuave,
					fontFamily: fuente.mono,
					fontSize: 16,
				}}
			>
				{direccion}
			</span>
		</div>
		<div
			style={{
				position: "relative",
				height: ventana.alto,
				overflow: "hidden",
				background: "#f3f4f6",
			}}
		>
			{children}
		</div>
	</div>
)

const RELACION = ventana.ancho / ventana.alto

/** Recuadro verde que señala una zona de la captura */
const Foco = ({
	x,
	y,
	w,
	h,
	p,
	salida,
}: {
	x: number
	y: number
	w: number
	h: number
	p: number
	salida: number
}) => {
	const m = 10 + (1 - p) * 26
	return (
		<div
			style={{
				position: "absolute",
				left: x - m,
				top: y - m,
				width: w + m * 2,
				height: h + m * 2,
				border: `3px solid ${color.acento}`,
				borderRadius: 12,
				boxShadow: `${resplandor(0.8)}, inset 0 0 0 2000px rgba(61,255,143,0.06)`,
				opacity: p * salida,
			}}
		/>
	)
}

/**
 * Contenido de la ventana: captura (o clip) encuadrada en `vista`, con paneo
 * suave hacia `vista2`, cambio a una segunda captura y recuadros de foco.
 */
export const Captura = ({ paso }: { paso: Paso }) => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()
	const { fuente: f, vista, vista2 = vista, dur } = paso

	const t = interpolate(frame, [12, dur - 12], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: Easing.inOut(Easing.cubic),
	})
	const deriva = 1 + 0.025 * t // ligero zoom continuo
	const anchoVista = (vista.ancho + (vista2.ancho - vista.ancho) * t) / deriva
	const cx =
		vista.x +
		vista.ancho / 2 +
		(vista2.x + vista2.ancho / 2 - vista.x - vista.ancho / 2) * t
	const cy =
		vista.y +
		vista.ancho / RELACION / 2 +
		(vista2.y +
			vista2.ancho / RELACION / 2 -
			vista.y -
			vista.ancho / RELACION / 2) *
			t
	const escala = ventana.ancho / anchoVista
	const x0 = cx - anchoVista / 2
	const y0 = cy - anchoVista / RELACION / 2

	const capa = {
		position: "absolute" as const,
		left: 0,
		top: 0,
		width: 1920,
		height: 1080,
	}
	const cambio = f.tipo === "imagen" && f.src2 ? (f.cambio ?? dur / 2) : null
	const mezcla =
		cambio === null
			? 0
			: interpolate(frame, [cambio, cambio + 10], [0, 1], {
					extrapolateLeft: "clamp",
					extrapolateRight: "clamp",
				})
	const focos = paso.foco ?? []

	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				top: 0,
				width: 1920,
				height: 1080,
				transformOrigin: "0 0",
				transform: `scale(${escala}) translate(${-x0}px, ${-y0}px)`,
			}}
		>
			{f.tipo === "imagen" ? (
				<>
					<Img src={staticFile(f.src)} style={capa} />
					{f.src2 && (
						<Img
							src={staticFile(f.src2)}
							style={{ ...capa, opacity: mezcla }}
						/>
					)}
				</>
			) : (
				<OffthreadVideo
					src={staticFile(f.src)}
					trimBefore={Math.round(f.inicio * fps)}
					playbackRate={f.velocidad}
					muted
					style={capa}
				/>
			)}
			{focos.map(([x, y, w, h, desde], i) => {
				const p = spring({ frame: frame - desde, fps, config: muelle.entrada })
				const siguiente = focos[i + 1]?.[4]
				const salida =
					siguiente === undefined
						? 1
						: interpolate(frame, [siguiente - 4, siguiente + 6], [1, 0], {
								extrapolateLeft: "clamp",
								extrapolateRight: "clamp",
							})
				return <Foco key={i} x={x} y={y} w={w} h={h} p={p} salida={salida} />
			})}
		</div>
	)
}
