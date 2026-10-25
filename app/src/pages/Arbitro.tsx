import { peaje } from "@stellar-scaffold/app-lib/clients"
import { demoSigner } from "../zbe/config"
import { as, send } from "../zbe/contracts"
import { useAction, useAllCharges } from "../zbe/hooks"
import {
	MissingKeys,
	PageHead,
	Plate,
	StatusBadge,
	Usdc,
	usePlateLookup,
	Who,
} from "../zbe/ui"

const Arbitro = () => {
	const arbiter = demoSigner("arbitro")
	const { run, pending } = useAction()
	const { data: charges } = useAllCharges()
	const plateOf = usePlateLookup()

	const disputed = charges?.filter((c) => c.status.tag === "Disputed") ?? []
	const closed =
		charges?.filter(
			(c) => c.status.tag === "Cancelled" || c.status.tag === "Settled",
		) ?? []

	const resolve = (charge_id: bigint, uphold: boolean) =>
		run(
			`resolve-${charge_id}`,
			async () => {
				if (!arbiter) return
				await send(
					await peaje.resolve({ charge_id, uphold }, as(arbiter)),
					arbiter,
				)
			},
			uphold
				? `Charge #${charge_id} upheld and collected`
				: `Charge #${charge_id} cancelled: the amount goes back to the pass`,
		)

	return (
		<div>
			<PageHead title="Independent arbiter" signer={arbiter?.label}>
				Only the arbiter (for example, a citizen ombudsman) can close an
				appealed charge. The city is never judge and party.
			</PageHead>

			{!arbiter && <MissingKeys who="arbiter" />}

			<div className="card zbe-section">
				<h2>Pending appeals</h2>
				{disputed.length === 0 ? (
					<p className="zbe-empty">No charges under appeal.</p>
				) : (
					<div className="zbe-table-wrap">
						<table className="zbe-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Vehicle</th>
									<th>Owner</th>
									<th>Amount</th>
									<th>Entry</th>
									<th>
										<span className="zbe-sr">Decision</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{disputed.map((c) => (
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
										<td data-label="Entry">
											{new Date(Number(c.created_at) * 1000).toLocaleString(
												"en-GB",
											)}
										</td>
										<td data-label="Decision" className="zbe-actions">
											<div className="zbe-row">
												<button
													className="zbe-btn-small"
													onClick={() => resolve(c.id, false)}
													disabled={!arbiter || !!pending}
												>
													Cancel and refund
												</button>
												<button
													className="zbe-btn-primary zbe-btn-small"
													onClick={() => resolve(c.id, true)}
													disabled={!arbiter || !!pending}
												>
													Uphold and collect
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<div className="card zbe-section">
				<h2>Closed charges</h2>
				{closed.length === 0 ? (
					<p className="zbe-empty">No closed charges yet.</p>
				) : (
					<div className="zbe-table-wrap">
						<table className="zbe-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Vehicle</th>
									<th>Amount</th>
									<th>Outcome</th>
								</tr>
							</thead>
							<tbody>
								{closed.map((c) => (
									<tr key={c.id.toString()}>
										<td className="zbe-num">{c.id.toString()}</td>
										<td data-label="Vehicle">
											<Plate plate={plateOf(c.plate_hash.toString("hex"))} />
										</td>
										<td data-label="Amount">
											<Usdc amount={c.amount} />
										</td>
										<td data-label="Outcome">
											<StatusBadge status={c.status.tag} />
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

export default Arbitro
