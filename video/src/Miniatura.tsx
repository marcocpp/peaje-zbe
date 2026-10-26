import { AbsoluteFill, Img, staticFile } from "remotion"
import { Chip, Punto } from "./componentes/Basicos"
import { Fondo } from "./componentes/Fondo"
import { PegatinaDGT, SenalZBE } from "./componentes/SenalZBE"
import { general } from "./contenido"
import { color, fuente, resplandor } from "./tema"

export const MINIATURA = { ancho: 1280, alto: 720 } as const

// Recorte de la captura del conductor (coordenadas de la captura 1920x1080)
const recorte = { x: 372, y: 332, ancho: 1176, alto: 546 }
const escala = 0.62

/** Miniatura de YouTube (1280x720): `npm run miniatura` */
export const Miniatura = () => (
	<AbsoluteFill style={{ fontFamily: fuente.sans, color: color.texto }}>
		<Fondo />

		{/* Captura real de la app, inclinada a la derecha */}
		<div
			style={{
				position: "absolute",
				left: 640,
				top: 210,
				width: recorte.ancho * escala,
				height: recorte.alto * escala,
				borderRadius: 18,
				overflow: "hidden",
				border: `2px solid ${color.acentoBorde}`,
				boxShadow: `${resplandor(0.7)}, 0 40px 80px rgba(0,0,0,0.7)`,
				transform: "perspective(1400px) rotateY(-14deg) rotate(2deg)",
			}}
		>
			<Img
				src={staticFile("capturas/07-conductor-cargo-cuenta-atras.png")}
				style={{
					position: "absolute",
					width: 1920 * escala,
					left: -recorte.x * escala,
					top: -recorte.y * escala,
				}}
			/>
		</div>

		{/* Pegatina B "bloqueada" y señal ZBE */}
		<div style={{ position: "absolute", left: 1090, top: 70 }}>
			<SenalZBE tam={150} />
		</div>
		<div
			style={{
				position: "absolute",
				left: 600,
				top: 470,
				transform: "rotate(-10deg)",
			}}
		>
			<PegatinaDGT nombre="B" tam={120} />
		</div>

		{/* Texto */}
		<div
			style={{
				position: "absolute",
				left: 64,
				top: 56,
				display: "flex",
				alignItems: "center",
				gap: 12,
				fontSize: 26,
				fontWeight: 700,
				color: color.textoSuave,
				letterSpacing: "0.04em",
				textTransform: "uppercase",
			}}
		>
			<Punto tam={12} />
			Live demo · Stellar testnet
		</div>

		<div
			style={{
				position: "absolute",
				left: 60,
				top: 120,
				width: 640,
				fontSize: 108,
				fontWeight: 800,
				lineHeight: 0.98,
				letterSpacing: "-0.04em",
			}}
		>
			No fine.
			<br />
			<span style={{ color: color.acento, textShadow: resplandor(0.8) }}>
				A toll
			</span>
			<br />
			you can
			<br />
			appeal.
		</div>

		<div
			style={{
				position: "absolute",
				left: 64,
				bottom: 56,
				display: "flex",
				gap: 14,
			}}
		>
			<Chip acento style={{ fontSize: 26, padding: "10px 22px" }}>
				{general.proyectoLargo}
			</Chip>
			<Chip style={{ fontSize: 26, padding: "10px 22px" }}>
				{general.hackaton}
			</Chip>
		</div>
	</AbsoluteFill>
)
