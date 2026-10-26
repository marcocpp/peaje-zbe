import { type ReactNode } from "react"
import {
	AbsoluteFill,
	Audio,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
} from "remotion"
import { MarcaPrototipo } from "./componentes/Basicos"
import { Fondo } from "./componentes/Fondo"
import { BLOQUES, general } from "./contenido"
import { Arquitectura } from "./escenas/Arquitectura"
import { DemoReal } from "./escenas/DemoReal"
import { Futuro } from "./escenas/Futuro"
import { Problema } from "./escenas/Problema"
import { Solucion } from "./escenas/Solucion"

/** Fundido de entrada y salida de cada bloque */
const Bloque = ({ dur, children }: { dur: number; children: ReactNode }) => {
	const frame = useCurrentFrame()
	const o = interpolate(frame, [0, 12, dur - 12, dur], [0, 1, 1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	})
	return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>
}

const ESCENAS = [
	{ nombre: "Problema", ...BLOQUES.problema, C: Problema },
	{ nombre: "Solución", ...BLOQUES.solucion, C: Solucion },
	{ nombre: "Demo real", ...BLOQUES.demo, C: DemoReal },
	{ nombre: "Arquitectura", ...BLOQUES.arquitectura, C: Arquitectura },
	{ nombre: "Progreso y futuro", ...BLOQUES.futuro, C: Futuro },
]

export const Demo = () => (
	<AbsoluteFill>
		<Fondo />
		{ESCENAS.map(({ nombre, desde, dur, C }) => (
			<Sequence key={nombre} name={nombre} from={desde} durationInFrames={dur}>
				<Bloque dur={dur}>
					<C />
				</Bloque>
			</Sequence>
		))}
		<MarcaPrototipo />
		{/* Locución (scripts/generar-voz.mjs) */}
		<Sequence name="Voz">
			<Audio src={staticFile(general.voz)} volume={general.volumenVoz} />
		</Sequence>
	</AbsoluteFill>
)
