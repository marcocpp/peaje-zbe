import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { Aparece, Chip, Etiqueta, Punto, Tarjeta } from "../componentes/Basicos"
import { Coche, Edificio } from "../componentes/Iconos"
import { SenalZBE } from "../componentes/SenalZBE"
import { Subtitulos } from "../componentes/Subtitulos"
import { general, solucion } from "../contenido"
import { color, fuente, muelle, resplandor } from "../tema"

const GIROS = [-5, 3, -3, 5]

export const Solucion = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()
	const titulo = spring({ frame, fps, config: muelle.entrada })
	// Fase 1 (para quién) y fase 2 (principios) comparten la franja central
	const fase1 = interpolate(frame, [205, 220, 390, 405], [0, 1, 1, 0], {
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
					flexDirection: "column",
					alignItems: "center",
					fontFamily: fuente.sans,
					opacity: Math.min(1, titulo * 1.4),
					transform: `translateY(${(1 - titulo) * 30}px)`,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 34 }}>
					<SenalZBE tam={128} />
					<div
						style={{
							fontSize: 132,
							fontWeight: 800,
							letterSpacing: "-0.045em",
							color: color.texto,
							lineHeight: 1,
						}}
					>
						{general.proyecto}
						<span style={{ color: color.acento, textShadow: resplandor(0.7) }}>
							{" "}
							on Stellar
						</span>
					</div>
				</div>
				<div
					style={{
						marginTop: 26,
						fontSize: 40,
						fontWeight: 500,
						color: color.textoSuave,
					}}
				>
					{solucion.lema}
				</div>
				<div style={{ marginTop: 30 }}>
					<Chip acento style={{ fontSize: 24, padding: "10px 22px" }}>
						<Punto tam={9} />
						{general.hackaton} · {general.categoria}
					</Chip>
				</div>
			</div>

			{/* Para quién */}
			<div
				style={{
					position: "absolute",
					top: 520,
					width: 1920,
					display: "flex",
					justifyContent: "center",
					gap: 40,
					opacity: fase1,
				}}
			>
				{solucion.paraQuien.map((q, i) => {
					const Icono = i === 0 ? Coche : Edificio
					return (
						<Aparece key={q.titulo} retraso={210 + i * 12}>
							<Tarjeta
								style={{
									width: 640,
									padding: "30px 34px",
									display: "flex",
									gap: 24,
									alignItems: "center",
								}}
							>
								<span
									style={{
										display: "grid",
										placeItems: "center",
										width: 76,
										height: 76,
										borderRadius: 18,
										background: color.acentoSuave,
										border: `1px solid ${color.acentoBorde}`,
										flexShrink: 0,
									}}
								>
									<Icono tam={42} color={color.acento} />
								</span>
								<div>
									<div style={{ fontSize: 38, fontWeight: 800 }}>
										{q.titulo}
									</div>
									<div
										style={{
											fontSize: 27,
											color: color.textoSuave,
											marginTop: 6,
											lineHeight: 1.3,
										}}
									>
										{q.texto}
									</div>
								</div>
							</Tarjeta>
						</Aparece>
					)
				})}
			</div>

			{/* Principios en pegatinas */}
			{frame >= 400 && (
				<div
					style={{
						position: "absolute",
						top: 560,
						width: 1920,
						display: "flex",
						justifyContent: "center",
						gap: 30,
					}}
				>
					{solucion.principios.map((p, i) => (
						<Etiqueta
							key={p.texto}
							texto={p.texto}
							icono={p.icono}
							giro={GIROS[i]}
							retraso={410 + i * 10}
						/>
					))}
				</div>
			)}

			<Subtitulos subtitulos={solucion.subtitulos} y={850} tamano={56} />
		</>
	)
}
