import { Aparece, Chip } from "../componentes/Basicos"
import { type Enlace, type Nodo, Diagrama } from "../componentes/Diagrama"
import { Subtitulos } from "../componentes/Subtitulos"
import { arquitectura as a } from "../contenido"
import { color, fuente } from "../tema"

const Titulo = ({ t, s }: { t: string; s?: string }) => (
	<>
		<div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>
			{t}
		</div>
		{s && (
			<div
				style={{
					fontSize: 20,
					color: color.textoSuave,
					marginTop: 6,
					lineHeight: 1.3,
				}}
			>
				{s}
			</div>
		)}
	</>
)

const actores: Nodo[] = a.actores.map((n, i) => ({
	id: n,
	x: 110,
	y: 150 + i * 102,
	w: 250,
	h: 76,
	retraso: 5 + i * 5,
	contenido: <div style={{ fontSize: 26, fontWeight: 700 }}>{n}</div>,
}))

const nodos: Nodo[] = [
	...actores,
	{
		id: "app",
		x: 450,
		y: 285,
		w: 340,
		h: 220,
		retraso: 40,
		contenido: (
			<>
				<Titulo t={a.app.titulo} />
				{a.app.lineas.map((l) => (
					<div
						key={l}
						style={{
							fontSize: 20,
							color: color.textoSuave,
							marginTop: 8,
							fontFamily: fuente.mono,
						}}
					>
						{l}
					</div>
				))}
			</>
		),
	},
	{
		id: "etiqueta",
		x: 990,
		y: 150,
		w: 360,
		h: 140,
		retraso: 70,
		activa: true,
		contenido: (
			<Titulo
				t={`Soroban · ${a.contratos[0].titulo}`}
				s={a.contratos[0].texto}
			/>
		),
	},
	{
		id: "peaje",
		x: 990,
		y: 420,
		w: 360,
		h: 140,
		retraso: 80,
		activa: true,
		contenido: (
			<Titulo
				t={`Soroban · ${a.contratos[1].titulo}`}
				s={a.contratos[1].texto}
			/>
		),
	},
	{
		id: "usdc",
		x: 1570,
		y: 420,
		w: 250,
		h: 140,
		retraso: 210,
		contenido: <Titulo t={a.usdc.titulo} s={a.usdc.texto} />,
	},
	{
		id: "tesoreria",
		x: 1570,
		y: 150,
		w: 250,
		h: 110,
		retraso: 240,
		contenido: <Titulo t={a.tesoreria} />,
	},
]

const enlaces: Enlace[] = [
	...a.actores.map((n, i) => ({ de: n, a: "app", retraso: 30 + i * 3 })),
	{ de: "app", a: "etiqueta", retraso: 60, etiqueta: "issue / get" },
	{
		de: "app",
		a: "peaje",
		retraso: 70,
		etiqueta: "report / settle",
		abajo: true,
	},
	{
		de: "peaje",
		a: "etiqueta",
		retraso: 100,
		etiqueta: "get label",
		vertical: true,
	},
	{ de: "peaje", a: "usdc", retraso: 220, etiqueta: "lock / pay" },
	{ de: "usdc", a: "tesoreria", retraso: 250, vertical: true },
]

export const Arquitectura = () => (
	<>
		<Diagrama nodos={nodos} enlaces={enlaces} />

		<Aparece
			retraso={120}
			style={{
				position: "absolute",
				top: 640,
				width: 1920,
				display: "flex",
				justifyContent: "center",
			}}
		>
			<Chip acento style={{ fontSize: 26, padding: "12px 26px" }}>
				{a.sinBaseDeDatos}
			</Chip>
		</Aparece>

		<div
			style={{
				position: "absolute",
				top: 730,
				width: 1920,
				display: "flex",
				justifyContent: "center",
				gap: 14,
			}}
		>
			{a.herramientas.map((h, i) => (
				<Aparece key={h} retraso={400 + i * 5} desde={16}>
					<Chip
						acento={h.includes("Claude")}
						style={
							h.includes("Claude")
								? { fontSize: 22 }
								: { fontSize: 22, color: color.texto }
						}
					>
						{h}
					</Chip>
				</Aparece>
			))}
		</div>

		<Subtitulos subtitulos={a.subtitulos} y={850} tamano={52} />
	</>
)
