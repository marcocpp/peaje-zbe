// Todos los textos y tiempos del vídeo. Edita aquí y vuelve a renderizar.
// Tiempos en fotogramas (30 fps): 30 = 1 s. Los de cada subtítulo son
// relativos al inicio de su bloque. `clave`: palabras resaltadas en verde.

export type Subtitulo = {
	texto: string
	clave?: string[]
	desde: number
	hasta: number
}

export const BLOQUES = {
	problema: { desde: 0, dur: 450 }, // 0:00-0:15
	solucion: { desde: 450, dur: 600 }, // 0:15-0:35
	demo: { desde: 1050, dur: 1500 }, // 0:35-1:25
	arquitectura: { desde: 2550, dur: 600 }, // 1:25-1:45
	futuro: { desde: 3150, dur: 450 }, // 1:45-2:00
} as const

export const DURACION_TOTAL = 3600

export const general = {
	marcaPrototipo: "Prototype · Stellar testnet",
	proyecto: "ZBE Toll",
	proyectoLargo: "ZBE Toll on Stellar",
	equipo: "Team IMPEDANCIA UNO",
	repo: "github.com/marcocpp/peaje-zbe",
	hackaton: "HackMeridian 2026",
	categoria: "Genesis track",
	// Pista de voz reservada: sustituye public/audio/voz.mp3 por tu grabación
	voz: "audio/voz.mp3",
	volumenVoz: 1,
}

// 0:00-0:15
export const problema = {
	subtitulos: [
		{
			texto: "Cities across Europe are rolling out Low Emission Zones.",
			clave: ["Low", "Emission", "Zones."],
			desde: 10,
			hasta: 150,
		},
		{
			texto: "Enter without a valid label, and a fine arrives weeks later.",
			clave: ["fine"],
			desde: 155,
			hasta: 295,
		},
		{
			texto:
				"A slow, expensive procedure for the city to collect a small amount.",
			clave: ["slow,", "expensive"],
			desde: 300,
			hasta: 440,
		},
	] satisfies Subtitulo[],
	etiquetas: ["Zero", "Eco", "C", "B", "No label"],
	carta: {
		titulo: "Fine notice",
		lineas: ["Entry detected", "Letter by post", "Weeks later"],
	},
}

// 0:15-0:35
export const solucion = {
	lema: "An opt-in, appealable toll for Low Emission Zones.",
	paraQuien: [
		{
			titulo: "Drivers",
			texto: "who would rather pay a daily fee than get a fine",
		},
		{
			titulo: "Cities",
			texto: "that want a fair, cheap and verifiable procedure",
		},
	],
	principios: [
		{ texto: "Consent first", icono: "mano" },
		{ texto: "Locked, not taken", icono: "candado" },
		{ texto: "Always appealable", icono: "balanza" },
		{ texto: "Private by design", icono: "ojo" },
	] as const,
	subtitulos: [
		{
			texto: "ZBE Toll turns the fine into a fair, voluntary toll on Stellar.",
			clave: ["voluntary"],
			desde: 20,
			hasta: 200,
		},
		{
			texto:
				"For drivers who would rather pay than be fined, and for the cities that run the zones.",
			clave: ["drivers", "cities"],
			desde: 205,
			hasta: 400,
		},
		{
			texto: "The fee is locked, not taken, and it can always be appealed.",
			clave: ["appealed."],
			desde: 405,
			hasta: 590,
		},
	] satisfies Subtitulo[],
}

// 0:35-1:25. Coordenadas en píxeles de la captura (1920x1080).
// vista: zona visible {x, y, ancho}; foco: recuadros [x, y, ancho, alto, desde]
export type Paso = {
	rol: string
	fuente:
		| { tipo: "imagen"; src: string; src2?: string; cambio?: number }
		| {
				tipo: "clip"
				src: string
				inicio: number // segundos del clip
				velocidad: number
		  }
	dur: number
	vista: { x: number; y: number; ancho: number }
	vista2?: { x: number; y: number; ancho: number }
	foco?: [number, number, number, number, number][]
	texto: string
	clave: string[]
	enVivo?: boolean
}

export const demo: { titulo: string; pasos: Paso[] } = {
	titulo: "Live demo on Stellar testnet",
	pasos: [
		{
			rol: "DGT",
			fuente: { tipo: "imagen", src: "capturas/02-dgt-etiquetas.png" },
			dur: 120,
			vista: { x: 330, y: 60, ancho: 1260 },
			vista2: { x: 330, y: 300, ancho: 1260 },
			foco: [[373, 568, 1175, 184, 40]],
			texto:
				"The DGT issues each car's environmental label as a non-transferable token.",
			clave: ["non-transferable"],
		},
		{
			rol: "Driver",
			fuente: {
				tipo: "imagen",
				src: "capturas/03-conductor-vacio.png",
				src2: "capturas/04-conductor-bono-20.png",
				cambio: 70,
			},
			dur: 165,
			vista: { x: 330, y: 230, ancho: 1260 },
			foco: [
				[997, 608, 388, 44, 20],
				[997, 402, 256, 96, 80],
			],
			texto:
				"Lucía (label B) tops up a 20 USDC ZBE pass. That is her prior consent.",
			clave: ["consent."],
		},
		{
			rol: "Camera",
			fuente: { tipo: "imagen", src: "capturas/05-camara-cargo-bloqueado.png" },
			dur: 150,
			vista: { x: 330, y: 220, ancho: 1260 },
			foco: [[397, 530, 790, 120, 25]],
			texto: "Her car 2222BCD enters the zone: 5 USDC are locked, not taken.",
			clave: ["locked,"],
		},
		{
			rol: "Camera",
			fuente: { tipo: "imagen", src: "capturas/06-camara-tres-coches.png" },
			dur: 120,
			vista: { x: 330, y: 220, ancho: 1260 },
			foco: [[397, 535, 720, 180, 15]],
			texto: "An Eco car enters for free. Without a pass, nothing is charged.",
			clave: ["free.", "nothing"],
		},
		{
			rol: "Driver",
			fuente: {
				tipo: "imagen",
				src: "capturas/07-conductor-cargo-cuenta-atras.png",
			},
			dur: 150,
			vista: { x: 330, y: 300, ancho: 1260 },
			foco: [
				[1266, 402, 257, 96, 20],
				[1110, 824, 175, 40, 70],
			],
			texto: "Lucía sees 5 USDC locked and a countdown to appeal.",
			clave: ["countdown"],
		},
		{
			rol: "Driver",
			fuente: {
				tipo: "imagen",
				src: "capturas/12-conductor-antes-de-alegar.png",
				src2: "capturas/13-conductor-alegado.png",
				cambio: 75,
			},
			dur: 165,
			vista: { x: 330, y: 340, ancho: 1260 },
			foco: [
				[1389, 826, 74, 40, 20],
				[997, 827, 129, 33, 85],
			],
			texto: "With her second car, 4444BCD, she appeals before the deadline.",
			clave: ["appeals"],
		},
		{
			rol: "Arbiter",
			fuente: {
				tipo: "imagen",
				src: "capturas/14-arbitro-pendiente.png",
				src2: "capturas/15-arbitro-anulado.png",
				cambio: 70,
			},
			dur: 150,
			vista: { x: 330, y: 60, ancho: 1260 },
			foco: [
				[1215, 389, 310, 40, 20],
				[373, 555, 1175, 55, 80],
			],
			texto: "Only an independent arbiter decides. Here: cancel and refund.",
			clave: ["independent"],
		},
		{
			rol: "City Hall",
			fuente: { tipo: "imagen", src: "capturas/10-ayuntamiento-cobrado.png" },
			dur: 150,
			vista: { x: 330, y: 230, ancho: 1260 },
			foco: [
				[1129, 779, 105, 32, 20],
				[373, 265, 295, 104, 70],
			],
			texto:
				"No appeal on 2222BCD: once the window closes, City Hall collects it.",
			clave: ["collects"],
		},
		{
			rol: "Camera",
			fuente: {
				tipo: "clip",
				src: "clips/entrada-camara.mp4",
				inicio: 3,
				velocidad: 2,
			},
			dur: 150,
			vista: { x: 330, y: 220, ancho: 1260 },
			foco: [[397, 530, 790, 120, 120]],
			texto:
				"Recorded live (2x speed): another entry locks the fee in seconds.",
			clave: ["live"],
			enVivo: true,
		},
		{
			rol: "stellar.expert",
			fuente: { tipo: "imagen", src: "capturas/20-explorer-cobro.png" },
			dur: 180,
			vista: { x: 260, y: 80, ancho: 1400 },
			foco: [
				[280, 92, 815, 36, 15],
				[305, 200, 160, 28, 45],
				[330, 645, 1010, 55, 85],
			],
			texto:
				"Confirmed on Stellar testnet: settle sends 5 USDC to the treasury.",
			clave: ["Confirmed"],
		},
	],
}

// 1:25-1:45
export const arquitectura = {
	actores: ["Driver", "Camera", "City Hall", "Arbiter", "DGT"],
	app: {
		titulo: "Web app",
		lineas: [
			"React + Vite + TypeScript",
			"Stellar Scaffold",
			"Generated TS clients",
		],
	},
	contratos: [
		{ titulo: "Etiqueta", texto: "Labels as non-transferable tokens" },
		{ titulo: "Peaje", texto: "Zones, passes, charges, appeals" },
	],
	usdc: { titulo: "USDC", texto: "Stellar Asset Contract" },
	tesoreria: "City treasury",
	sinBaseDeDatos: "No backend, no database: state lives in contract storage",
	herramientas: [
		"Rust · soroban-sdk",
		"Stellar Scaffold",
		"Stellar Registry",
		"Stellar CLI",
		"React + Vite",
		"Playwright",
		"Claude Code (AI)",
	],
	subtitulos: [
		{
			texto:
				"No backend and no database: every rule lives in two Soroban contracts.",
			clave: ["Soroban"],
			desde: 15,
			hasta: 200,
		},
		{
			texto:
				"The fee stays in the contract, in USDC, until the appeal window closes.",
			clave: ["USDC,"],
			desde: 205,
			hasta: 395,
		},
		{
			texto:
				"Built with Rust, Stellar Scaffold and Registry, with Claude Code as AI pair programmer.",
			clave: ["Claude", "Code"],
			desde: 400,
			hasta: 590,
		},
	] satisfies Subtitulo[],
}

// 1:45-2:00
export const futuro = {
	hecho: {
		titulo: "Built at HackMeridian",
		lineas: [
			"2 Soroban contracts",
			"19 unit tests passing",
			"5 role views",
			"Deployed on testnet with Stellar Registry",
		],
	},
	siguiente: {
		titulo: "What's next",
		lineas: [
			"Pilot with a city",
			"Real cameras signing their reports",
			"DGT integration",
			"Multiple zones with different rules",
		],
	},
	subtitulos: [
		{
			texto: "Two contracts, 19 tests, five role views, live on testnet.",
			clave: ["testnet."],
			desde: 10,
			hasta: 215,
		},
		{
			texto: "Next: a pilot city, real cameras and DGT integration.",
			clave: ["pilot"],
			desde: 220,
			hasta: 440,
		},
	] satisfies Subtitulo[],
}
