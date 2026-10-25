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
			<PageHead icon="⚖️" title="Independent arbiter" signer={arbiter?.label}>
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
									<th />
								</tr>
							</thead>
							<tbody>
								{disputed.map((c) => (
									<tr key={c.id.toString()}>
										<td>{c.id.toString()}</td>
										<td>
											<Plate plate={plateOf(c.plate_hash.toString("hex"))} />
										</td>
										<td>
											<Who address={c.owner} />
										</td>
										<td>
											<Usdc amount={c.amount} />
										</td>
										<td>
											{new Date(Number(c.created_at) * 1000).toLocaleString(
												"en-GB",
											)}
										</td>
										<td>
											<div className="zbe-row">
												<button
													className="zbe-btn-primary"
													onClick={() => resolve(c.id, false)}
													disabled={!arbiter || !!pending}
												>
													Cancel charge
												</button>
												<button
													className="zbe-btn-danger"
													onClick={() => resolve(c.id, true)}
													disabled={!arbiter || !!pending}
												>
													Uphold
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
							<tbody>
								{closed.map((c) => (
									<tr key={c.id.toString()}>
										<td>#{c.id.toString()}</td>
										<td>
											<Plate plate={plateOf(c.plate_hash.toString("hex"))} />
										</td>
										<td>
											<Usdc amount={c.amount} />
										</td>
										<td>
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
