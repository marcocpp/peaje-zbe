import { etiqueta } from "@stellar-scaffold/app-lib/clients"
import { useState } from "react"
import { useWallet } from "../hooks/useWallet"
import { CATEGORIES, DEMO_DRIVERS, demoSigner, UNIT } from "../zbe/config"
import { as, send } from "../zbe/contracts"
import { useAction, useLabels, useUsdcBalance } from "../zbe/hooks"
import { normalizePlate, plateHash, rememberPlate } from "../zbe/plates"
import { addTrustline, mintUsdc } from "../zbe/token"
import { CategoryBadge, MissingKeys, PageTitle, Usdc, Who } from "../zbe/ui"

const Dgt = () => {
	const dgt = demoSigner("me")
	const { address, signTransaction } = useWallet()
	const { run, pending } = useAction()
	const { data: labels } = useLabels()
	const { data: walletUsdc, isFetched } = useUsdcBalance(address)

	const [plate, setPlate] = useState("")
	const [owner, setOwner] = useState("")
	const [category, setCategory] = useState(1)

	const owners = [
		...(address ? [{ address, label: "Mi wallet" }] : []),
		...DEMO_DRIVERS.map(demoSigner).flatMap((s) =>
			s ? [{ address: s.address, label: s.label }] : [],
		),
	]
	const ownerAddress = owner || owners[0]?.address || ""

	const issue = () =>
		run(
			"issue",
			async () => {
				if (!dgt) return
				const p = normalizePlate(plate)
				await send(
					await etiqueta.issue(
						{
							plate_hash: await plateHash(p),
							owner: ownerAddress,
							category,
						},
						as(dgt),
					),
					dgt,
				)
				rememberPlate(p)
				setPlate("")
			},
			`Etiqueta emitida para ${normalizePlate(plate)}`,
		)

	const revoke = (p: string) =>
		run(
			`revoke-${p}`,
			async () => {
				if (!dgt) return
				await send(
					await etiqueta.revoke({ plate_hash: await plateHash(p) }, as(dgt)),
					dgt,
				)
			},
			`Etiqueta de ${p} retirada`,
		)

	return (
		<div>
			<PageTitle title="DGT · Etiquetas ambientales">
				La DGT es la única emisora. La etiqueta va ligada al vehículo: el
				titular no la puede transferir, solo la DGT la reasigna o la retira.
			</PageTitle>

			{!dgt && <MissingKeys who="DGT (me)" />}

			<div className="card zbe-section">
				<h2>Emitir etiqueta</h2>
				<div className="zbe-form">
					<label>
						Matrícula
						<input
							value={plate}
							onChange={(e) => setPlate(e.target.value)}
							placeholder="4444BCD"
						/>
					</label>
					<label>
						Titular
						<select
							value={ownerAddress}
							onChange={(e) => setOwner(e.target.value)}
						>
							{owners.map((o) => (
								<option key={o.address} value={o.address}>
									{o.label}
								</option>
							))}
						</select>
					</label>
					<label>
						Categoría
						<select
							value={category}
							onChange={(e) => setCategory(Number(e.target.value))}
						>
							{CATEGORIES.map((c) => (
								<option key={c.value} value={c.value}>
									{c.name}
								</option>
							))}
						</select>
					</label>
					<button
						onClick={issue}
						disabled={
							!dgt || !!pending || !normalizePlate(plate) || !ownerAddress
						}
					>
						Emitir
					</button>
				</div>
			</div>

			<div className="card zbe-section">
				<h2>Registro</h2>
				<table className="zbe-table">
					<thead>
						<tr>
							<th>Matrícula</th>
							<th>Etiqueta</th>
							<th>Titular</th>
							<th>Hash en la cadena</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{(labels ?? []).map((l) => (
							<tr key={l.plate}>
								<td>
									<span className="zbe-plate">{l.plate}</span>
								</td>
								<td>
									{l.label ? (
										<CategoryBadge value={l.label.category} />
									) : (
										<span className="zbe-muted">sin etiqueta</span>
									)}
								</td>
								<td>{l.label && <Who address={l.label.owner} />}</td>
								<td>
									<code title={l.hash}>{l.hash.slice(0, 16)}…</code>
								</td>
								<td>
									{l.label && (
										<button
											onClick={() => revoke(l.plate)}
											disabled={!dgt || !!pending}
										>
											Retirar
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{address && (
				<div className="card zbe-section">
					<h2>USDC de prueba para mi wallet</h2>
					<p className="zbe-muted">
						Saldo: <Usdc amount={walletUsdc} />. Solo existe en la red de
						pruebas.
					</p>
					{isFetched && walletUsdc === null ? (
						<button
							onClick={() =>
								run(
									"trust",
									() =>
										addTrustline({
											address,
											label: "Mi wallet",
											signTransaction,
										}),
									"USDC activado en tu wallet",
								)
							}
							disabled={!!pending}
						>
							1 · Activar USDC (firma tu wallet)
						</button>
					) : (
						<button
							onClick={() =>
								run(
									"mint",
									async () => dgt && mintUsdc(dgt, address, 50n * UNIT),
									"50 USDC enviados a tu wallet",
								)
							}
							disabled={!dgt || !!pending}
						>
							Recibir 50 USDC
						</button>
					)}
				</div>
			)}
		</div>
	)
}

export default Dgt
