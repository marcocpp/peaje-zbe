import { Composition } from "remotion"
import { DURACION_TOTAL } from "./contenido"
import { Demo } from "./Demo"
import { MINIATURA, Miniatura } from "./Miniatura"
import { VIDEO } from "./tema"

export const Root = () => (
	<>
		<Composition
			id="Demo"
			component={Demo}
			durationInFrames={DURACION_TOTAL}
			fps={VIDEO.fps}
			width={VIDEO.ancho}
			height={VIDEO.alto}
		/>
		<Composition
			id="Miniatura"
			component={Miniatura}
			durationInFrames={1}
			fps={VIDEO.fps}
			width={MINIATURA.ancho}
			height={MINIATURA.alto}
		/>
	</>
)
