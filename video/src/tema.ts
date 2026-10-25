// Sistema de diseño del vídeo: "dark tech explainer"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/inter/800.css"
import "@fontsource/jetbrains-mono/500.css"

export const VIDEO = { ancho: 1920, alto: 1080, fps: 30 } as const

export const color = {
	fondo: "#06080a",
	cuadricula: "rgba(255,255,255,0.035)",
	particula: "rgba(120,255,170,0.35)",
	tarjeta: "#101417",
	tarjetaAlta: "#151a1e",
	borde: "#232a30",
	bordeFuerte: "#323b42",
	texto: "#f3f6f4",
	textoSuave: "#a7b0b6",
	pendiente: "#4b545a",
	acento: "#3dff8f",
	acentoSuave: "rgba(61,255,143,0.14)",
	acentoBorde: "rgba(61,255,143,0.45)",
	ambar: "#ffc94a",
	rojo: "#ff5a5f",
} as const

export const resplandor = (fuerza = 1) =>
	`0 0 ${18 * fuerza}px rgba(61,255,143,${0.45 * fuerza}), 0 0 ${
		48 * fuerza
	}px rgba(61,255,143,${0.18 * fuerza})`

export const fuente = {
	sans: '"Inter", system-ui, sans-serif',
	mono: '"JetBrains Mono", ui-monospace, monospace',
} as const

export const radio = { s: 8, m: 14, l: 22 } as const

// Muelles de spring(): suave para entradas, firme para pegatinas
export const muelle = {
	suave: { damping: 200 },
	entrada: { damping: 18, stiffness: 110, mass: 0.9 },
	pegatina: { damping: 11, stiffness: 140 },
} as const

// Ventana de la app en la demo (coordenadas del vídeo)
export const ventana = {
	x: 210,
	y: 70,
	ancho: 1500,
	barra: 46,
	alto: 740, // alto del contenido, sin la barra
} as const
