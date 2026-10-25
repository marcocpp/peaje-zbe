import { Fragment } from "react"
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { type Subtitulo } from "../contenido"
import { color, fuente, muelle, resplandor } from "../tema"

type Props = {
	subtitulos: Subtitulo[]
	y: number
	tamano?: number
	ancho?: number
}

// Mezcla lineal entre dos colores hex
const mezcla = (a: string, b: string, t: number) => {
	const ha = a.match(/\w\w/g)!.map((h) => parseInt(h, 16))
	const hb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16))
	return `rgb(${ha.map((v, i) => Math.round(v + (hb[i] - v) * t)).join(",")})`
}

/** Recuadro de selección con esquinas, como en un editor */
const Seleccion = ({ p }: { p: number }) => {
	const esquina = (top: boolean, left: boolean) => ({
		position: "absolute" as const,
		width: 14,
		height: 14,
		[top ? "top" : "bottom"]: -3,
		[left ? "left" : "right"]: -3,
		borderColor: color.acento,
		borderStyle: "solid",
		borderWidth: `${top ? 3 : 0}px ${left ? 0 : 3}px ${top ? 0 : 3}px ${left ? 3 : 0}px`,
	})
	return (
		<span
			style={{
				position: "absolute",
				inset: "-0.06em -0.22em",
				border: `1px solid ${color.acentoBorde}`,
				background: color.acentoSuave,
				borderRadius: 4,
				opacity: p,
				transform: `scale(${0.85 + 0.15 * p})`,
				boxShadow: resplandor(0.5 * p),
			}}
		>
			<span style={esquina(true, true)} />
			<span style={esquina(true, false)} />
			<span style={esquina(false, true)} />
			<span style={esquina(false, false)} />
		</span>
	)
}

const Linea = ({
	s,
	local,
	tamano,
}: {
	s: Subtitulo
	local: number
	tamano: number
}) => {
	const { fps } = useVideoConfig()
	const dur = s.hasta - s.desde
	const palabras = s.texto.split(" ")
	const porPalabra = Math.min(7, (dur * 0.55) / palabras.length)
	const clave = new Set(s.clave ?? [])

	// Agrupa palabras clave contiguas para un solo recuadro
	const grupos: { palabras: string[]; inicio: number; clave: boolean }[] = []
	palabras.forEach((w, i) => {
		const esClave = clave.has(w)
		const ultimo = grupos[grupos.length - 1]
		if (ultimo && esClave && ultimo.clave) ultimo.palabras.push(w)
		else grupos.push({ palabras: [w], inicio: i, clave: esClave })
	})

	const entrada = spring({
		frame: local,
		fps,
		config: muelle.suave,
		durationInFrames: 18,
	})
	const salida = interpolate(local, [dur - 10, dur], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	})
	const dicha = (i: number) =>
		interpolate(local, [6 + i * porPalabra, 10 + i * porPalabra], [0, 1], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		})

	return (
		<div
			style={{
				display: "flex",
				flexWrap: "wrap",
				justifyContent: "center",
				columnGap: "0.27em",
				rowGap: "0.12em",
				fontSize: tamano,
				fontWeight: 700,
				letterSpacing: "-0.015em",
				lineHeight: 1.18,
				opacity: entrada * salida,
				transform: `translateY(${(1 - entrada) * 18}px)`,
			}}
		>
			{grupos.map((g) => {
				if (!g.clave) {
					return g.palabras.map((w, k) => (
						<span
							key={g.inicio + k}
							style={{
								color: mezcla(
									color.pendiente,
									color.texto,
									dicha(g.inicio + k),
								),
							}}
						>
							{w}
						</span>
					))
				}
				const p = spring({
					frame: local - (6 + g.inicio * porPalabra),
					fps,
					config: muelle.entrada,
				})
				const d = dicha(g.inicio)
				return (
					<span
						key={g.inicio}
						style={{ position: "relative", display: "inline-block" }}
					>
						<Seleccion p={p} />
						<span
							style={{
								position: "relative",
								color: mezcla(color.pendiente, color.acento, d),
								textShadow:
									d > 0.5 ? "0 0 22px rgba(61,255,143,0.45)" : undefined,
							}}
						>
							{g.palabras.map((w, k) => (
								<Fragment key={k}>
									{k > 0 && " "}
									{w}
								</Fragment>
							))}
						</span>
					</span>
				)
			})}
		</div>
	)
}

/**
 * Subtítulos con tiempos fijos: palabras dichas en blanco, pendientes en gris
 * y la palabra clave en verde con recuadro de selección.
 */
export const Subtitulos = ({
	subtitulos,
	y,
	tamano = 60,
	ancho = 1560,
}: Props) => {
	const frame = useCurrentFrame()
	const activo = subtitulos.find((s) => frame >= s.desde && frame < s.hasta)
	return (
		<div
			style={{
				position: "absolute",
				top: y,
				left: (1920 - ancho) / 2,
				width: ancho,
				fontFamily: fuente.sans,
				textAlign: "center",
			}}
		>
			{activo && (
				<Linea
					key={activo.desde}
					s={activo}
					local={frame - activo.desde}
					tamano={tamano}
				/>
			)}
		</div>
	)
}
