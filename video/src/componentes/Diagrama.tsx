import { type ReactNode } from "react"
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { color, fuente, muelle } from "../tema"
import { Tarjeta } from "./Basicos"

export type Nodo = {
	id: string
	x: number
	y: number
	w: number
	h: number
	retraso: number
	contenido: ReactNode
	activa?: boolean
}

export type Enlace = {
	de: string
	a: string
	retraso: number
	etiqueta?: string
	// lado de salida/llegada: horizontal (por defecto) o vertical
	vertical?: boolean
	abajo?: boolean // etiqueta bajo el conector
}

const puntos = (de: Nodo, a: Nodo, vertical?: boolean) => {
	if (vertical) {
		const x = (Math.max(de.x, a.x) + Math.min(de.x + de.w, a.x + a.w)) / 2
		const arriba = de.y < a.y
		return {
			x1: x,
			y1: arriba ? de.y + de.h : de.y,
			x2: x,
			y2: arriba ? a.y : a.y + a.h,
		}
	}
	return { x1: de.x + de.w, y1: de.y + de.h / 2, x2: a.x, y2: a.y + a.h / 2 }
}

/** Diagrama de arquitectura: cajas que aparecen y conectores que se dibujan */
export const Diagrama = ({
	nodos,
	enlaces,
}: {
	nodos: Nodo[]
	enlaces: Enlace[]
}) => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()
	const porId = Object.fromEntries(nodos.map((n) => [n.id, n]))

	return (
		<>
			<svg
				width={1920}
				height={1080}
				style={{ position: "absolute", left: 0, top: 0 }}
			>
				<defs>
					<marker
						id="punta"
						viewBox="0 0 10 10"
						refX="8"
						refY="5"
						markerWidth="7"
						markerHeight="7"
						orient="auto"
					>
						<path d="M0 0L10 5L0 10z" fill={color.acento} />
					</marker>
				</defs>
				{enlaces.map((e, i) => {
					const { x1, y1, x2, y2 } = puntos(porId[e.de], porId[e.a], e.vertical)
					const mx = (x1 + x2) / 2
					const d = e.vertical
						? `M${x1} ${y1} L${x2} ${y2}`
						: `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
					const largo = Math.hypot(x2 - x1, y2 - y1) * 1.15 + 20
					const p = interpolate(frame - e.retraso, [0, 22], [0, 1], {
						extrapolateLeft: "clamp",
						extrapolateRight: "clamp",
					})
					// pulso que recorre el conector una vez dibujado
					const ciclo = ((frame - e.retraso - 22) % 60) / 60
					const tt = Math.max(0, ciclo)
					const bx =
						(1 - tt) ** 3 * x1 +
						3 * (1 - tt) ** 2 * tt * mx +
						3 * (1 - tt) * tt ** 2 * mx +
						tt ** 3 * x2
					const by = e.vertical
						? y1 + (y2 - y1) * tt
						: (1 - tt) ** 3 * y1 +
							3 * (1 - tt) ** 2 * tt * y1 +
							3 * (1 - tt) * tt ** 2 * y2 +
							tt ** 3 * y2
					const px = e.vertical ? x1 : bx
					return (
						<g key={i} opacity={p > 0 ? 1 : 0}>
							<path
								d={d}
								fill="none"
								stroke={color.acento}
								strokeOpacity={0.55}
								strokeWidth={2.5}
								strokeDasharray={largo}
								strokeDashoffset={largo * (1 - p)}
								markerEnd={p > 0.95 ? "url(#punta)" : undefined}
							/>
							{p >= 1 && frame - e.retraso > 22 && (
								<circle
									cx={px}
									cy={by}
									r={5}
									fill={color.acento}
									style={{ filter: "drop-shadow(0 0 6px #3dff8f)" }}
								/>
							)}
							{e.etiqueta && (
								<text
									x={e.vertical ? x1 + 14 : mx}
									y={
										e.vertical
											? (y1 + y2) / 2 + 7
											: e.abajo
												? Math.max(y1, y2) + 30
												: Math.min(y1, y2) - 12
									}
									fill={color.textoSuave}
									fontFamily={fuente.mono}
									fontSize={17}
									textAnchor={e.vertical ? "start" : "middle"}
									opacity={p}
								>
									{e.etiqueta}
								</text>
							)}
						</g>
					)
				})}
			</svg>
			{nodos.map((n) => {
				const p = spring({
					frame: frame - n.retraso,
					fps,
					config: muelle.entrada,
				})
				return (
					<Tarjeta
						key={n.id}
						activa={n.activa}
						style={{
							position: "absolute",
							left: n.x,
							top: n.y,
							width: n.w,
							height: n.h,
							opacity: Math.min(1, p * 1.5),
							transform: `scale(${0.9 + 0.1 * p})`,
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							padding: "0 22px",
							borderRadius: 16,
						}}
					>
						{n.contenido}
					</Tarjeta>
				)
			})}
		</>
	)
}
