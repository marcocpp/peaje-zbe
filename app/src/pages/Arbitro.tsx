import { peaje } from "@stellar-scaffold/app-lib/clients"
import { demoSigner } from "../zbe/config"
import { as, send } from "../zbe/contracts"
import { useAction, useAllCharges } from "../zbe/hooks"
import {
	MissingKeys,
	PageTitle,
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
				? `Cargo #${charge_id} confirmado y cobrado`
				: `Cargo #${charge_id} anulado: el importe vuelve al bono`,
		)

	return (
		<div>
			<PageTitle title="Árbitro independiente">
				Solo el árbitro (por ejemplo, un defensor del ciudadano) puede cerrar un
				cargo alegado. El ayuntamiento no es juez y parte.
			</PageTitle>

			{!arbiter && <MissingKeys who="árbitro" />}

			<div className="card zbe-section">
				<h2>Alegaciones pendientes</h2>
				{disputed.length === 0 ? (
					<p className="zbe-empty">No hay cargos en disputa.</p>
				) : (
					<table className="zbe-table">
						<thead>
							<tr>
								<th>#</th>
								<th>Vehículo</th>
								<th>Titular</th>
								<th>Importe</th>
								<th>Entrada</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{disputed.map((c) => (
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
										{new Date(Number(c.created_at) * 1000).toLocaleString()}
									</td>
									<td className="zbe-row">
										<button
											onClick={() => resolve(c.id, false)}
											disabled={!arbiter || !!pending}
										>
											Anular
										</button>
										<button
											onClick={() => resolve(c.id, true)}
											disabled={!arbiter || !!pending}
										>
											Confirmar cargo
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<div className="card zbe-section">
				<h2>Historial</h2>
				{closed.length === 0 ? (
					<p className="zbe-empty">Sin cargos cerrados.</p>
				) : (
					<table className="zbe-table">
						<tbody>
							{closed.map((c) => (
								<tr key={c.id.toString()}>
									<td>#{c.id.toString()}</td>
									<td>
										<span className="zbe-plate">
											{plateOf(c.plate_hash.toString("hex"))}
										</span>
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
				)}
			</div>
		</div>
	)
}

export default Arbitro
