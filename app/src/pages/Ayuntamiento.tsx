import { peaje } from "@stellar-scaffold/app-lib/clients"
import { useEffect, useState } from "react"
import { CATEGORIES, demoSigner, parseUsdc, UNIT, ZONE } from "../zbe/config"
import { as, isOpen, send } from "../zbe/contracts"
import {
	useAction,
	useAllCharges,
	useCollected,
	useConfig,
	useNow,
	useUsdcBalance,
	useZone,
} from "../zbe/hooks"
import {
	Countdown,
	MissingKeys,
	PageTitle,
	Stat,
	StatusBadge,
	Usdc,
	usePlateLookup,
	Who,
} from "../zbe/ui"

const Ayuntamiento = () => {
	const admin = demoSigner("me")
	const now = useNow()
	const { run, pending } = useAction()
	const { data: charges } = useAllCharges()
	const { data: collected } = useCollected()
	const { data: config } = useConfig()
	const { data: treasury } = useUsdcBalance(config?.treasury)
	const { data: zone } = useZone()
	const plateOf = usePlateLookup()

	const [minCategory, setMinCategory] = useState(3)
	const [fee, setFee] = useState("5")
	const [appealSecs, setAppealSecs] = useState("60")
	useEffect(() => {
		if (!zone) return
		setMinCategory(zone.min_category)
		setFee((Number(zone.fee) / Number(UNIT)).toString())
		setAppealSecs(zone.appeal_secs.toString())
	}, [zone])

	const saveZone = () =>
		run(
			"zone",
			async () => {
				if (!admin) return
				await send(
					await peaje.set_zone(
						{
							zone_id: ZONE,
							min_category: minCategory,
							fee: parseUsdc(fee),
							appeal_secs: BigInt(appealSecs),
						},
						as(admin),
					),
					admin,
				)
			},
			"Zona actualizada",
		)

	// settle lo puede llamar cualquiera; aquí paga la transacción el ayuntamiento
	const settle = (charge_id: bigint) =>
		run(
			`settle-${charge_id}`,
			async () => {
				if (!admin) return
				await send(await peaje.settle({ charge_id }, as(admin)), admin)
			},
			`Cargo #${charge_id} cobrado: transferido a la tesorería`,
		)

	const ready =
		charges?.filter((c) => c.status.tag === "Pending" && !isOpen(c, now)) ?? []
	const count = (tag: string) =>
		charges?.filter((c) => c.status.tag === tag).length ?? 0

	return (
		<div>
			<PageTitle title="Ayuntamiento">
				Reglas de la ZBE, cargos y recaudación. El ayuntamiento no puede tocar
				un cargo en plazo de alegación ni resolver disputas.
			</PageTitle>

			{!admin && <MissingKeys who="ayuntamiento (me)" />}

			<div className="zbe-stats">
				<Stat label="Recaudado">
					<Usdc amount={collected} />
				</Stat>
				<Stat label="Tesorería (cartera)">
					<Usdc amount={treasury} />
				</Stat>
				<Stat label="Bloqueados">{count("Pending")}</Stat>
				<Stat label="En disputa">{count("Disputed")}</Stat>
			</div>

			<div className="card zbe-section">
				<h2>Zona {ZONE}</h2>
				<div className="zbe-form">
					<label>
						Entran gratis desde
						<select
							value={minCategory}
							onChange={(e) => setMinCategory(Number(e.target.value))}
						>
							{CATEGORIES.map((c) => (
								<option key={c.value} value={c.value}>
									{c.name}
								</option>
							))}
						</select>
					</label>
					<label>
						Tarifa diaria (USDC)
						<input
							type="number"
							min="1"
							value={fee}
							onChange={(e) => setFee(e.target.value)}
						/>
					</label>
					<label>
						Plazo para alegar (s)
						<input
							type="number"
							min="0"
							value={appealSecs}
							onChange={(e) => setAppealSecs(e.target.value)}
						/>
					</label>
					<button onClick={saveZone} disabled={!admin || !!pending}>
						Guardar zona
					</button>
				</div>
			</div>

			<div className="card zbe-section">
				<div className="zbe-row" style={{ justifyContent: "space-between" }}>
					<h2>Cargos</h2>
					<button
						onClick={() =>
							run("settle-all", async () => {
								for (const c of ready) await settle(c.id)
							})
						}
						disabled={!admin || !!pending || ready.length === 0}
					>
						Cobrar vencidos ({ready.length})
					</button>
				</div>
				{!charges?.length ? (
					<p className="zbe-empty">Todavía no hay cargos.</p>
				) : (
					<div className="zbe-table-wrap">
						<table className="zbe-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Vehículo</th>
									<th>Titular</th>
									<th>Importe</th>
									<th>Estado</th>
									<th>Plazo</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{charges.map((c) => (
									<tr key={c.id.toString()}>
										<td>{c.id.toString()}</td>
										<td>
											<span className="zbe-plate">
												{plateOf(c.plate_hash.toString("hex"))}
											</span>
										</td>
										<td>
											<Who address={c.owner} />
										</td>
										<td>
											<Usdc amount={c.amount} />
										</td>
										<td>
											<StatusBadge status={c.status.tag} />
										</td>
										<td>
											<Countdown charge={c} now={now} />
										</td>
										<td>
											{c.status.tag === "Pending" && !isOpen(c, now) && (
												<button
													onClick={() => settle(c.id)}
													disabled={!admin || !!pending}
												>
													Cobrar
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}

export default Ayuntamiento
