// Iconos de trazo hechos a mano (SVG), sin recursos externos
type P = { tam?: number; color?: string; grosor?: number }

const base = ({ tam = 28, color = "currentColor", grosor = 2 }: P) => ({
	width: tam,
	height: tam,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: color,
	strokeWidth: grosor,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
})

export const Candado = (p: P) => (
	<svg {...base(p)}>
		<rect x="5" y="11" width="14" height="9" rx="2" />
		<path d="M8 11V8a4 4 0 0 1 8 0v3" />
	</svg>
)

export const Balanza = (p: P) => (
	<svg {...base(p)}>
		<path d="M12 4v16M7 20h10M5 7h14" />
		<path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z" />
	</svg>
)

export const Mano = (p: P) => (
	<svg {...base(p)}>
		<path d="M4 13l4 4c1 1 2 1.5 3.5 1.5H15a4 4 0 0 0 4-4V11" />
		<path d="M7 14V7a1.5 1.5 0 0 1 3 0v5M10 11V5.5a1.5 1.5 0 0 1 3 0V11M13 11V6.5a1.5 1.5 0 0 1 3 0V12M16 12V9a1.5 1.5 0 0 1 3 0v2" />
	</svg>
)

export const Ojo = (p: P) => (
	<svg {...base(p)}>
		<path d="M3 3l18 18" />
		<path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a12 12 0 0 1-2.7 3.4M6.2 7.6A12 12 0 0 0 2.5 12c1 2 4.5 6 9.5 6a9.6 9.6 0 0 0 4-.9" />
		<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
	</svg>
)

export const Check = (p: P) => (
	<svg {...base(p)}>
		<path d="M5 12.5l4.5 4.5L19 7.5" />
	</svg>
)

export const Flecha = (p: P) => (
	<svg {...base(p)}>
		<path d="M5 12h14M13 6l6 6-6 6" />
	</svg>
)

export const Coche = (p: P) => (
	<svg {...base(p)}>
		<path d="M5 16V12l2-5h10l2 5v4" />
		<path d="M3 16h18v2H3zM7.5 12h9" />
		<circle cx="7.5" cy="18.5" r="1.5" />
		<circle cx="16.5" cy="18.5" r="1.5" />
	</svg>
)

export const Camara = (p: P) => (
	<svg {...base(p)}>
		<rect x="3" y="7" width="18" height="13" rx="2" />
		<path d="M8 7l1.5-3h5L16 7" />
		<circle cx="12" cy="13.5" r="3.5" />
	</svg>
)

export const Edificio = (p: P) => (
	<svg {...base(p)}>
		<path d="M3 21h18M4 10h16M12 3l8 7H4z" />
		<path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
	</svg>
)

export const Tarjeta = (p: P) => (
	<svg {...base(p)}>
		<rect x="3" y="5" width="18" height="14" rx="2" />
		<circle cx="8.5" cy="11" r="2" />
		<path d="M6 16c.6-1.5 1.5-2 2.5-2s1.9.5 2.5 2M14 10h4M14 13h4" />
	</svg>
)

export const Sobre = (p: P) => (
	<svg {...base(p)}>
		<rect x="3" y="5" width="18" height="14" rx="2" />
		<path d="M3 7l9 6 9-6" />
	</svg>
)

export const Reloj = (p: P) => (
	<svg {...base(p)}>
		<circle cx="12" cy="12" r="8.5" />
		<path d="M12 7.5V12l3 2" />
	</svg>
)

export const ICONOS = {
	candado: Candado,
	balanza: Balanza,
	mano: Mano,
	ojo: Ojo,
} as const
