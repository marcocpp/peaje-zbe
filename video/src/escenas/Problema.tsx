import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { Aparece, Tarjeta } from "../componentes/Basicos"
import { Camara, Reloj, Sobre } from "../componentes/Iconos"
import { PegatinaDGT, SenalZBE } from "../componentes/SenalZBE"
import { Subtitulos } from "../componentes/Subtitulos"
import { problema } from "../contenido"
import { color, fuente, muelle } from "../tema"

const ICONOS_CARTA = [Camara, Sobre, Reloj]

export const Problema = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()
	const senal = spring({ frame: frame - 5, fps, config: muelle.pegatina })
	// La señal se desplaza a la izquierda cuando aparece la carta
	const lado = spring({ frame: frame - 150, fps, config: muelle.suave })

	return (
		<>
			<div
				style={{
					position: "absolute",
					top: 140,
					left: 960 - 160 - lado * 380,
					transform: `scale(${senal}) rotate(${(1 - senal) * -20}deg)`,
				}}
			>
				<SenalZBE tam={320} />
			</div>

			{/* Etiquetas ambientales bajo la señal */}
			<div
				style={{
					position: "absolute",
					top: 500,
					left: 960 - 330 - lado * 380,
					width: 660,
					display: "flex",
					justifyContent: "center",
					gap: 22,
				}}
			>
				{problema.etiquetas.map((e, i) => (
					<Aparece key={e} retraso={30 + i * 6}>
						<PegatinaDGT nombre={e} tam={96} />
					</Aparece>
				))}
			</div>

			{/* La multa tradicional, semanas después */}
			<div
				style={{ position: "absolute", top: 150, left: 1010, opacity: lado }}
			>
				<Tarjeta style={{ width: 640, padding: "34px 40px" }}>
					<div
						style={{
							fontFamily: fuente.sans,
							fontSize: 22,
							fontWeight: 700,
							letterSpacing: "0.14em",
							textTransform: "uppercase",
							color: color.rojo,
							marginBottom: 26,
						}}
					>
						{problema.carta.titulo}
					</div>
					{problema.carta.lineas.map((l, i) => {
						const Icono = ICONOS_CARTA[i]
						const p = interpolate(frame, [175 + i * 22, 190 + i * 22], [0, 1], {
							extrapolateLeft: "clamp",
							extrapolateRight: "clamp",
						})
						return (
							<div
								key={l}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 20,
									padding: "16px 0",
									borderTop: i ? `1px solid ${color.borde}` : undefined,
									opacity: p,
									transform: `translateX(${(1 - p) * 24}px)`,
									fontSize: 34,
									fontWeight: 600,
									color: i === 2 ? color.texto : color.textoSuave,
								}}
							>
								<Icono
									tam={36}
									color={i === 2 ? color.rojo : color.textoSuave}
								/>
								{l}
							</div>
						)
					})}
				</Tarjeta>
			</div>

			<Subtitulos subtitulos={problema.subtitulos} y={760} tamano={66} />
		</>
	)
}
