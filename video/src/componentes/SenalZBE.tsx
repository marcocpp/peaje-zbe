import { color, fuente } from "../tema"

/** Señal circular de Zona de Bajas Emisiones (SVG propio) */
export const SenalZBE = ({ tam = 260 }: { tam?: number }) => (
	<svg width={tam} height={tam} viewBox="0 0 200 200">
		<circle cx="100" cy="100" r="94" fill="#fff" />
		<circle
			cx="100"
			cy="100"
			r="84"
			fill="none"
			stroke="#d7262e"
			strokeWidth="20"
		/>
		<text
			x="100"
			y="118"
			textAnchor="middle"
			fontFamily={fuente.sans}
			fontWeight={800}
			fontSize="52"
			fill="#111"
			letterSpacing="-1"
		>
			ZBE
		</text>
	</svg>
)

// Colores aproximados de las pegatinas ambientales de la DGT
const PEGATINAS: Record<
	string,
	{ fondo: string; texto: string; borde?: string }
> = {
	Zero: { fondo: "#1d5fbf", texto: "#fff" },
	Eco: {
		fondo: "linear-gradient(90deg,#1d5fbf 50%,#2e9a4b 50%)",
		texto: "#fff",
	},
	C: { fondo: "#2e9a4b", texto: "#fff" },
	B: { fondo: "#f2c230", texto: "#1a1a1a" },
	"No label": {
		fondo: "transparent",
		texto: color.textoSuave,
		borde: color.bordeFuerte,
	},
}

export const PegatinaDGT = ({
	nombre,
	tam = 110,
}: {
	nombre: string
	tam?: number
}) => {
	const p = PEGATINAS[nombre]
	return (
		<div
			style={{
				width: tam,
				height: tam,
				borderRadius: 999,
				background: p.fondo,
				border: p.borde
					? `2px dashed ${p.borde}`
					: "4px solid rgba(255,255,255,0.9)",
				display: "grid",
				placeItems: "center",
				color: p.texto,
				fontFamily: fuente.sans,
				fontWeight: 800,
				fontSize: nombre.length > 3 ? tam * 0.17 : tam * 0.3,
				textAlign: "center",
				lineHeight: 1,
				boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
			}}
		>
			{nombre === "Zero" ? "0" : nombre.toUpperCase()}
		</div>
	)
}
