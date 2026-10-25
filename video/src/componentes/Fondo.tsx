import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion"
import { color } from "../tema"

const PARTICULAS = Array.from({ length: 46 }, (_, i) => ({
	x: random(`x${i}`) * 1920,
	y: random(`y${i}`) * 1080,
	r: 1 + random(`r${i}`) * 2.2,
	vx: (random(`vx${i}`) - 0.5) * 0.35,
	vy: -0.08 - random(`vy${i}`) * 0.22,
	fase: random(`f${i}`) * Math.PI * 2,
}))

const mod = (n: number, m: number) => ((n % m) + m) % m

/** Fondo casi negro con cuadrícula sutil, partículas lentas y viñeta */
export const Fondo = () => {
	const frame = useCurrentFrame()
	const { width, height } = useVideoConfig()
	const desplaza = mod(frame * 0.15, 64)

	return (
		<AbsoluteFill style={{ backgroundColor: color.fondo, overflow: "hidden" }}>
			<AbsoluteFill
				style={{
					backgroundImage: `linear-gradient(${color.cuadricula} 1px, transparent 1px), linear-gradient(90deg, ${color.cuadricula} 1px, transparent 1px)`,
					backgroundSize: "64px 64px",
					backgroundPosition: `0 ${desplaza}px`,
				}}
			/>
			<svg width={width} height={height} style={{ position: "absolute" }}>
				{PARTICULAS.map((p, i) => {
					const x = mod(p.x + p.vx * frame, width)
					const y = mod(p.y + p.vy * frame, height)
					const brillo =
						0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 40 + p.fase))
					return (
						<circle
							key={i}
							cx={x}
							cy={y}
							r={p.r}
							fill={color.particula}
							opacity={brillo}
						/>
					)
				})}
			</svg>
			<AbsoluteFill
				style={{
					background:
						"radial-gradient(ellipse at 50% 40%, rgba(61,255,143,0.05) 0%, transparent 45%), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
				}}
			/>
		</AbsoluteFill>
	)
}
