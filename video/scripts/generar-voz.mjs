// Genera public/audio/voz.mp3: locución sintética (edge-tts) de cada subtítulo,
// colocada en su fotograma de inicio y acelerada si no cabe en su hueco.
//
//   python3 -m venv video/.voz-venv && video/.voz-venv/bin/pip install edge-tts
//   node --experimental-strip-types video/scripts/generar-voz.mjs
//
// VOZ=en-US-AndrewNeural cambia la voz. Necesita ffmpeg y red (servicio de
// Microsoft Edge: solo se envían los textos de los subtítulos).
import { execFileSync } from "node:child_process"
import { mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
	BLOQUES,
	DURACION_TOTAL,
	arquitectura,
	demo,
	futuro,
	problema,
	solucion,
} from "../src/contenido.ts"

const FPS = 30
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const edgeTts = join(raiz, ".voz-venv/bin/edge-tts")
const voz = process.env.VOZ ?? "en-US-AndrewNeural"
const tmp = join(raiz, "out/voz")
const salida = join(raiz, "public/audio/voz.mp3")

// Pronunciación: matrículas, siglas y acotaciones que no se leen
const PRONUNCIA = [
	[/each car's environmental label/g, "each car's label"],
	[/ ZBE pass\. That is her/g, " pass: her"],
	[/ 2222BCD enters/g, " enters"],
	[/, 4444BCD,/g, ","],
	[/on 2222BCD:/g, "on the first car,"],
	[/\bZBE\b/g, "Z B E"],
	[/\bDGT\b/g, "D G T"],
	[/\bUSDC\b/g, "U S D C"],
	[/ \(label B\)/g, ", with a B label,"],
	[/ \(2x speed\)/g, ""],
]
const hablado = (t) => PRONUNCIA.reduce((s, [re, r]) => s.replace(re, r), t)

// Subtítulos con fotogramas absolutos
const frases = [
	...[
		[problema, BLOQUES.problema],
		[solucion, BLOQUES.solucion],
		[arquitectura, BLOQUES.arquitectura],
		[futuro, BLOQUES.futuro],
	].flatMap(([b, { desde }]) =>
		b.subtitulos.map((s) => ({
			texto: s.texto,
			desde: desde + s.desde,
			hasta: desde + s.hasta,
		})),
	),
	...demo.pasos.map((p, i) => {
		const inicio =
			BLOQUES.demo.desde + demo.pasos.slice(0, i).reduce((n, q) => n + q.dur, 0)
		return { texto: p.texto, desde: inicio + 6, hasta: inicio + p.dur - 6 }
	}),
].sort((a, b) => a.desde - b.desde)

const duracion = (f) =>
	Number(
		execFileSync("ffprobe", [
			"-v",
			"error",
			"-show_entries",
			"format=duration",
			"-of",
			"csv=p=0",
			f,
		]).toString(),
	)

rmSync(tmp, { recursive: true, force: true })
mkdirSync(tmp, { recursive: true })

const pistas = frases.map((f, i) => {
	const crudo = join(tmp, `${i}.mp3`)
	for (let intento = 1; ; intento++) {
		try {
			execFileSync(
				edgeTts,
				[
					"--voice",
					voz,
					"--rate",
					"+5%",
					"--text",
					hablado(f.texto),
					"--write-media",
					crudo,
				],
				{ stdio: "ignore" },
			)
			break
		} catch (e) {
			if (intento === 3) throw e
		}
	}
	// La voz puede seguir hasta que empieza la frase siguiente
	const fin = frases[i + 1]?.desde ?? DURACION_TOTAL
	const hueco = (fin - f.desde) / FPS - 0.2
	const dur = duracion(crudo)
	const tempo = Math.min(1.3, Math.max(1, dur / hueco))
	console.log(
		`${(f.desde / FPS).toFixed(1).padStart(6)}s  ${dur.toFixed(2)}s/${hueco.toFixed(2)}s  x${tempo.toFixed(2)}  ${f.texto}`,
	)
	if (dur / tempo > hueco + 0.05)
		console.warn("  ⚠ no cabe ni acelerada: acorta el texto")
	return { archivo: crudo, ms: Math.round((f.desde / FPS) * 1000), tempo }
})

// Mezcla: cada frase con su retardo, sin normalizar volúmenes, a la duración del vídeo
const filtros = pistas.map(
	(p, i) => `[${i}:a]atempo=${p.tempo.toFixed(3)},adelay=${p.ms}:all=1[a${i}]`,
)
const mezcla = `${pistas.map((_, i) => `[a${i}]`).join("")}amix=inputs=${pistas.length}:normalize=0,apad,atrim=0:${DURACION_TOTAL / FPS},loudnorm=I=-16:TP=-1.5:LRA=11[voz]`
execFileSync("ffmpeg", [
	"-y",
	"-v",
	"error",
	...pistas.flatMap((p) => ["-i", p.archivo]),
	"-filter_complex",
	[...filtros, mezcla].join(";"),
	"-map",
	"[voz]",
	"-ar",
	"48000",
	"-ac",
	"2",
	"-b:a",
	"192k",
	salida,
])
rmSync(tmp, { recursive: true, force: true })
console.log(`→ ${salida} (${duracion(salida).toFixed(1)} s)`)
