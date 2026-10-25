import { interpolate, useCurrentFrame } from "remotion"
import { Aparece, Tarjeta } from "../componentes/Basicos"
import { Check, Flecha } from "../componentes/Iconos"
import { Subtitulos } from "../componentes/Subtitulos"
import { futuro, general } from "../contenido"
import { color, fuente, resplandor } from "../tema"

const Lista = ({
	titulo,
	lineas,
	retraso,
	hecho,
}: {
	titulo: string
	lineas: string[]
	retraso: number
	hecho: boolean
}) => (
	<Aparece retraso={retraso}>
		<Tarjeta activa={hecho} style={{ width: 760, padding: "34px 40px" }}>
			<div
				style={{
					fontSize: 22,
					fontWeight: 700,
					letterSpacing: "0.14em",
					textTransform: "uppercase",
					color: hecho ? color.acento : color.textoSuave,
					marginBottom: 18,
				}}
			>
				{titulo}
			</div>
			{lineas.map((l, i) => (
				<Aparece key={l} retraso={retraso + 12 + i * 8} desde={12}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 18,
							padding: "11px 0",
							fontSize: 32,
							fontWeight: 600,
						}}
					>
						{hecho ? (
							<Check tam={32} color={color.acento} grosor={2.6} />
						) : (
							<Flecha tam={30} color={color.textoSuave} />
						)}
						{l}
					</div>
				</Aparece>
			))}
		</Tarjeta>
	</Aparece>
)

export const Futuro = () => {
	const frame = useCurrentFrame()
	const negro = interpolate(frame, [430, 450], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	})
	return (
		<>
			<div
				style={{
					position: "absolute",
					top: 110,
					width: 1920,
					display: "flex",
					justifyContent: "center",
					gap: 40,
				}}
			>
				<Lista
					titulo={futuro.hecho.titulo}
					lineas={futuro.hecho.lineas}
					retraso={5}
					hecho
				/>
				<Lista
					titulo={futuro.siguiente.titulo}
					lineas={futuro.siguiente.lineas}
					retraso={200}
					hecho={false}
				/>
			</div>

			<Aparece
				retraso={60}
				style={{
					position: "absolute",
					top: 590,
					width: 1920,
					textAlign: "center",
					fontFamily: fuente.sans,
				}}
			>
				<div style={{ fontSize: 44, fontWeight: 800, color: color.texto }}>
					{general.proyectoLargo} · {general.equipo}
				</div>
				<div
					style={{
						marginTop: 16,
						fontFamily: fuente.mono,
						fontSize: 38,
						color: color.acento,
						textShadow: resplandor(0.6),
					}}
				>
					{general.repo}
				</div>
			</Aparece>

			<Subtitulos subtitulos={futuro.subtitulos} y={850} tamano={54} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: "#000",
					opacity: negro,
				}}
			/>
		</>
	)
}
