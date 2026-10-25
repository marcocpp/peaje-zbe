import {
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from "remotion"
import { Chip, Punto } from "../componentes/Basicos"
import { Subtitulos } from "../componentes/Subtitulos"
import { Captura, VentanaApp } from "../componentes/VentanaApp"
import { demo, type Paso } from "../contenido"
import { color, fuente, muelle, ventana } from "../tema"

const RUTAS: Record<string, string> = {
	DGT: "/dgt",
	Driver: "/conductor",
	Camera: "/camara",
	Arbiter: "/arbitro",
	"City Hall": "/ayuntamiento",
}

const direccion = (p: Paso) =>
	p.rol === "stellar.expert"
		? "stellar.expert/explorer/testnet/tx/0ae839f2…"
		: `localhost:4173${RUTAS[p.rol] ?? ""}`

// Inicio de cada paso dentro del bloque
const INICIOS = demo.pasos.reduce<number[]>(
	(acc, p, i) => [...acc, i ? acc[i - 1] + demo.pasos[i - 1].dur : 0],
	[],
)

/** Contenido de un paso con fundido de entrada */
const Contenido = ({ paso }: { paso: Paso }) => {
	const frame = useCurrentFrame()
	const o = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" })
	return (
		<div style={{ position: "absolute", inset: 0, opacity: o }}>
			<Captura paso={paso} />
		</div>
	)
}

export const DemoReal = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()
	const entrada = spring({ frame, fps, config: muelle.entrada })
	const indice = Math.max(
		0,
		INICIOS.findLastIndex((ini) => frame >= ini),
	)
	const paso = demo.pasos[indice]
	const total = demo.pasos.length
	const pie = ventana.y + ventana.barra + ventana.alto

	return (
		<>
			<div
				style={{
					opacity: Math.min(1, entrada * 1.3),
					transform: `translateY(${(1 - entrada) * 50}px)`,
				}}
			>
				<VentanaApp
					titulo={
						paso.rol === "stellar.expert"
							? "stellar.expert · testnet"
							: `ZBE Toll · ${paso.rol}`
					}
					direccion={direccion(paso)}
				>
					{demo.pasos.map((p, i) => (
						<Sequence
							key={i}
							from={INICIOS[i]}
							durationInFrames={p.dur}
							layout="none"
						>
							<Contenido paso={p} />
						</Sequence>
					))}
				</VentanaApp>
			</div>

			{/* Rótulo del paso y progreso */}
			<div
				style={{
					position: "absolute",
					top: pie + 16,
					left: ventana.x,
					width: ventana.ancho,
					display: "flex",
					alignItems: "center",
					gap: 14,
					fontFamily: fuente.sans,
				}}
			>
				<Chip acento>
					<span style={{ fontFamily: fuente.mono }}>
						{String(indice + 1).padStart(2, "0")}/{total}
					</span>
					<span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
						{paso.rol}
					</span>
				</Chip>
				{paso.enVivo && (
					<Chip
						style={{ color: color.texto, borderColor: "rgba(255,90,95,0.6)" }}
					>
						<Punto c={color.rojo} tam={9} />
						LIVE RECORDING
					</Chip>
				)}
				<div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
					{demo.pasos.map((_, i) => (
						<span
							key={i}
							style={{
								width: 34,
								height: 5,
								borderRadius: 9,
								background: i <= indice ? color.acento : color.borde,
								boxShadow:
									i === indice ? "0 0 10px rgba(61,255,143,0.7)" : undefined,
							}}
						/>
					))}
				</div>
			</div>

			<Subtitulos
				subtitulos={demo.pasos.map((p, i) => ({
					texto: p.texto,
					clave: p.clave,
					desde: INICIOS[i],
					hasta: INICIOS[i] + p.dur,
				}))}
				y={pie + 66}
				tamano={44}
				ancho={ventana.ancho}
			/>
		</>
	)
}
