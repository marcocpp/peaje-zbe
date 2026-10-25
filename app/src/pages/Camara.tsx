import { etiqueta, peaje } from "@stellar-scaffold/app-lib/clients"
import { useState } from "react"
import { categoryName, demoSigner, formatUsdc, ZONE } from "../zbe/config"
import { as, send } from "../zbe/contracts"
import { useAction, useLabels, useZone } from "../zbe/hooks"
import { normalizePlate, plateHash } from "../zbe/plates"
import { MissingKeys, PageHead, Plate } from "../zbe/ui"

type Outcome = {
	id: number
	at: Date
	plate: string
	kind: "ok" | "charge" | "nobono"
	title: string
	detail: string
}

let nextId = 0

const ICONS: Record<Outcome["kind"], string> = {
	ok: "✅",
	charge: "🔒",
	nobono: "⚠️",
}

const Camara = () => {
	const camera = demoSigner("camara")
	const { data: labels } = useLabels()
	const { data: zone } = useZone()
	const { run, pending } = useAction()
	const [plate, setPlate] = useState("2222BCD")
	const [log, setLog] = useState<Outcome[]>([])

	const describe = (
		p: string,
		label: Awaited<ReturnType<typeof etiqueta.get>>["result"],
		id: bigint | undefined,
	): Outcome => {
		const base = { id: nextId++, at: new Date(), plate: p }
		if (id !== undefined) {
			return {
				...base,
				kind: "charge",
				title: `Charge #${id} locked · ${zone ? formatUsdc(zone.fee) : ""}`,
				detail: `Label ${categoryName(label!.category)} is not allowed here. The fee is locked in the owner's ZBE pass and can still be appealed. (A second entry on the same day returns the same charge.)`,
			}
		}
		if (!label) {
			return {
				...base,
				kind: "nobono",
				title: "No registered label",
				detail:
					"no_bono event: the case goes to the ordinary off-chain procedure. Nothing is charged.",
			}
		}
		if (zone && label.category >= zone.min_category) {
			return {
				...base,
				kind: "ok",
				title: `Access granted · label ${categoryName(label.category)}`,
				detail: "Nothing is charged and the entry is not stored.",
			}
		}
		return {
			...base,
			kind: "nobono",
			title: "No ZBE pass or not enough balance",
			detail:
				"Nothing is charged. no_bono event: the ordinary off-chain procedure applies.",
		}
	}

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

	return (
		<div>
			<PageHead icon="📷" title="Camera · centro zone" signer={camera?.label}>
				Simulates an authorized plate-reading camera (the oracle). Only the
				plate&apos;s HMAC is sent on-chain, never the plate itself.
			</PageHead>

			{!camera && <MissingKeys who="camera" />}

			<div className="card zbe-section">
				<div className="zbe-form">
					<label>
						Known plate
						<select value={plate} onChange={(e) => setPlate(e.target.value)}>
							{(labels ?? []).map((p) => (
								<option key={p.plate} value={p.plate}>
									{p.plate} · {p.note}
								</option>
							))}
						</select>
					</label>
					<label>
						…or type any plate
						<input
							value={plate}
							onChange={(e) => setPlate(e.target.value)}
							placeholder="1234ABC"
						/>
					</label>
					<button
						className="zbe-btn-primary zbe-big-button"
						onClick={enter}
						disabled={!camera || !!pending || !plate}
					>
						{pending ? "Reading…" : "🚗 Car enters"}
					</button>
				</div>
				{zone && (
					<p className="zbe-note" style={{ marginTop: "1.25rem" }}>
						Zone <strong>{ZONE}</strong>: {categoryName(zone.min_category)} and
						cleaner enter for free · fee {formatUsdc(zone.fee)} per day ·{" "}
						{zone.appeal_secs.toString()}s to appeal
					</p>
				)}
			</div>

			{log.map((o) => (
				<div
					key={o.id}
					className={`card zbe-result zbe-result--${o.kind}`}
				>
					<span className="zbe-result-icon">{ICONS[o.kind]}</span>
					<div>
						<h3>
							<Plate plate={o.plate} /> {o.title}
						</h3>
						<p className="zbe-muted">
							{o.at.toLocaleTimeString("en-GB")} · {o.detail}
						</p>
					</div>
				</div>
			))}
		</div>
	)
}

export default Camara
