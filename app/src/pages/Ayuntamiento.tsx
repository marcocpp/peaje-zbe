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
	PageHead,
	Plate,
	Stat,
	StatusBadge,
	Usdc,
	usePlateLookup,
	Who,
} from "../zbe/ui"

const parseSecs = (text: string) => {
	if (!/^\s*\d+\s*$/.test(text)) {
		throw new Error("The appeal window must be a whole number of seconds")
	}
	return BigInt(text.trim())
}

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
							appeal_secs: parseSecs(appealSecs),
						},
						as(admin),
					),
					admin,
				)
			},
			"Zone rules updated",
		)

	// settle lo puede llamar cualquiera; aquí paga la transacción el ayuntamiento
	const settle = (charge_id: bigint) =>
		run(
			`settle-${charge_id}`,
			async () => {
				if (!admin) return
				await send(await peaje.settle({ charge_id }, as(admin)), admin)
			},
			`Charge #${charge_id} collected and sent to the treasury`,
		)

	const ready =
		charges?.filter((c) => c.status.tag === "Pending" && !isOpen(c, now)) ?? []
	const count = (tag: string) =>
		charges?.filter((c) => c.status.tag === tag).length ?? 0

	return (
		<div>
			<PageHead title="City Hall" signer={admin?.label}>
				Zone rules, charges and revenue. The city cannot touch a charge during
				its appeal window, and it cannot resolve appeals.
			</PageHead>

			{!admin && <MissingKeys who="City Hall (me)" />}

			<dl className="zbe-stats">
				<Stat label="Collected">
					<Usdc amount={collected} />
				</Stat>
				<Stat label="Treasury wallet">
					<Usdc amount={treasury} />
				</Stat>
				<Stat label="Locked charges">{count("Pending")}</Stat>
				<Stat label="Under appeal">{count("Disputed")}</Stat>
			</dl>

			<div className="card zbe-section">
				<h2>Zone rules – {ZONE}</h2>
				<div className="zbe-form">
					<label>
						Free entry from label
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
						Daily fee (USDC)
						<input
							inputMode="decimal"
							value={fee}
							onChange={(e) => setFee(e.target.value)}
						/>
					</label>
					<label>
						Appeal window (seconds)
						<input
							inputMode="numeric"
							value={appealSecs}
							onChange={(e) => setAppealSecs(e.target.value)}
						/>
					</label>
					<button
						className="zbe-btn-primary"
						onClick={saveZone}
						disabled={!admin || !!pending}
					>
						Save rules
					</button>
				</div>
			</div>

			<div className="card zbe-section">
				<div className="zbe-row zbe-spread">
					<h2>Charges</h2>
					<button
						className="zbe-btn-primary"
						onClick={() =>
							run(
								"settle-all",
								async () => {
									if (!admin) return
									// Una a una: todas las firma la misma cuenta (secuencia)
									for (const c of ready) {
										await send(
											await peaje.settle({ charge_id: c.id }, as(admin)),
											admin,
										)
									}
								},
								`${ready.length} charges collected and sent to the treasury`,
							)
						}
						disabled={!admin || !!pending || ready.length === 0}
					>
						Collect all due ({ready.length})
					</button>
				</div>
				{!charges?.length ? (
					<p className="zbe-empty">No charges yet.</p>
				) : (
					<div className="zbe-table-wrap">
						<table className="zbe-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Vehicle</th>
									<th>Owner</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Deadline</th>
									<th>
										<span className="zbe-sr">Actions</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{charges.map((c) => (
									<tr key={c.id.toString()}>
										<td className="zbe-num">{c.id.toString()}</td>
										<td data-label="Vehicle">
											<Plate plate={plateOf(c.plate_hash.toString("hex"))} />
										</td>
										<td data-label="Owner">
											<Who address={c.owner} />
										</td>
										<td data-label="Amount">
											<Usdc amount={c.amount} />
										</td>
										<td data-label="Status">
											<StatusBadge status={c.status.tag} />
										</td>
										<td data-label="Deadline">
											<Countdown charge={c} now={now} />
										</td>
										<td data-label="Actions" className="zbe-actions">
											{c.status.tag === "Pending" && !isOpen(c, now) && (
												<button
													className="zbe-btn-primary zbe-btn-small"
													onClick={() => settle(c.id)}
													disabled={!admin || !!pending}
												>
													Collect
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
