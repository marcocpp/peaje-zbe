import { etiqueta, peaje } from "@stellar-scaffold/app-lib/clients"
import { useState } from "react"
import { categoryName, demoSigner, formatUsdc, ZONE } from "../zbe/config"
import { as, send } from "../zbe/contracts"
import { useAction, useLabels, useZone } from "../zbe/hooks"
import { normalizePlate, plateHash } from "../zbe/plates"
import { MissingKeys, PageTitle } from "../zbe/ui"

type Outcome = {
	at: Date
	plate: string
	kind: "ok" | "charge" | "nobono"
	title: string
	detail: string
}

const Camara = () => {
	const camera = demoSigner("camara")
	const { data: labels } = useLabels()
	const { data: zone } = useZone()
	const { run, pending } = useAction()
	const [plate, setPlate] = useState("2222BCD")
	const [log, setLog] = useState<Outcome[]>([])

	const enter = () =>
		run("enter", async () => {
			if (!camera) return
			const p = normalizePlate(plate)
			const plate_hash = await plateHash(p)
			// Lecturas previas solo para explicar el resultado en pantalla
			const label = (await etiqueta.get({ plate_hash })).result
			const id = await send(
				await peaje.report_entry(
					{ camera: camera.address, plate_hash, zone_id: ZONE },
					as(camera),
				),
				camera,
			)
			setLog((l) => [describe(p, label, id ?? undefined), ...l])
		})

	const describe = (
		p: string,
		label: Awaited<ReturnType<typeof etiqueta.get>>["result"],
		id: bigint | undefined,
	): Outcome => {
		const base = { at: new Date(), plate: p }
		if (id !== undefined) {
			return {
				...base,
				kind: "charge",
				title: `Cargo bloqueado #${id}: ${zone ? formatUsdc(zone.fee) : ""}`,
				detail: `Etiqueta ${categoryName(label!.category)} no admitida. El importe queda bloqueado en el bono y el titular puede alegar. (Si ya entró hoy, es el mismo cargo: uno por vehículo, zona y día.)`,
			}
		}
		if (!label) {
			return {
				...base,
				kind: "nobono",
				title: "Vehículo sin etiqueta registrada",
				detail:
					"Evento no_bono: se tramita por el procedimiento ordinario, fuera de la cadena.",
			}
		}
		if (zone && label.category >= zone.min_category) {
			return {
				...base,
				kind: "ok",
				title: `Acceso permitido · etiqueta ${categoryName(label.category)}`,
				detail: "No se cobra nada ni se guarda la entrada.",
			}
		}
		return {
			...base,
			kind: "nobono",
			title: "Sin bono ZBE o saldo insuficiente",
			detail:
				"No se cobra nada. Evento no_bono: procedimiento ordinario fuera de la cadena.",
		}
	}

	return (
		<div>
			<PageTitle title="Cámara · ZBE centro">
				Simula la lectura de matrícula de una cámara autorizada (oráculo). Solo
				se envía el HMAC de la matrícula, nunca la matrícula en claro.
			</PageTitle>

			{!camera && <MissingKeys who="cámara" />}

			<div className="card zbe-section">
				<div className="zbe-form">
					<label>
						Matrícula
						<select value={plate} onChange={(e) => setPlate(e.target.value)}>
							{(labels ?? []).map((p) => (
								<option key={p.plate} value={p.plate}>
									{p.plate} · {p.note}
								</option>
							))}
						</select>
					</label>
					<label>
						…u otra
						<input
							value={plate}
							onChange={(e) => setPlate(e.target.value)}
							placeholder="1234ABC"
						/>
					</label>
					<button
						className="zbe-big-button"
						onClick={enter}
						disabled={!camera || !!pending || !plate}
					>
						{pending ? "Leyendo…" : "🚗 Coche entra"}
					</button>
				</div>
				{zone && (
					<p className="zbe-muted" style={{ marginTop: "1rem" }}>
						Zona {ZONE}: entran gratis {categoryName(zone.min_category)} y
						superiores · tarifa {formatUsdc(zone.fee)}/día ·{" "}
						{zone.appeal_secs.toString()} s para alegar
					</p>
				)}
			</div>

			{log.map((o) => (
				<div
					key={o.at.getTime()}
					className={`card zbe-result zbe-result--${o.kind}`}
				>
					<h3>
						<span className="zbe-plate">{o.plate}</span> {o.title}
					</h3>
					<p className="zbe-muted">
						{o.at.toLocaleTimeString()} · {o.detail}
					</p>
				</div>
			))}
		</div>
	)
}

export default Camara
