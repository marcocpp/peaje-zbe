import { peaje } from "@stellar-scaffold/app-lib/clients"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useWallet } from "../hooks/useWallet"
import {
	DEMO_DRIVERS,
	type DemoName,
	demoSigner,
	parseUsdc,
	type Signer,
} from "../zbe/config"
import { as, isOpen, send } from "../zbe/contracts"
import {
	useAction,
	useBono,
	useCharges,
	useLabels,
	useNow,
	useUsdcBalance,
	useZone,
} from "../zbe/hooks"
import { addTrustline } from "../zbe/token"
import {
	CategoryBadge,
	Countdown,
	PageTitle,
	StatusBadge,
	Usdc,
	usePlateLookup,
} from "../zbe/ui"

const WALLET = "wallet"

const Conductor = () => {
	const { address, signTransaction } = useWallet()
	const [who, setWho] = useState<string>(address ? WALLET : "lucia")

	const signer: Signer | undefined =
		who === WALLET
			? address
				? { address, label: "Mi wallet", signTransaction }
				: undefined
			: demoSigner(who as DemoName)

	return (
		<div>
			<PageTitle title="Conductor">
				Tu etiqueta, tu bono ZBE y los cargos con su plazo para alegar.
			</PageTitle>

			<div className="zbe-row zbe-section">
				<span className="zbe-muted">Ver como:</span>
				<select value={who} onChange={(e) => setWho(e.target.value)}>
					{address && <option value={WALLET}>Mi wallet (Freighter)</option>}
					{DEMO_DRIVERS.map((d) => (
						<option key={d} value={d}>
							{demoSigner(d)?.label ?? d}
						</option>
					))}
				</select>
			</div>

			{signer ? (
				<DriverPanel
					key={signer.address}
					signer={signer}
					isWallet={who === WALLET}
				/>
			) : (
				<div className="card zbe-warning">
					Conecta tu wallet o ejecuta <code>scripts/zbe-setup.sh</code> para
					tener conductores de demo.
				</div>
			)}
		</div>
	)
}

const DriverPanel = ({
	signer,
	isWallet,
}: {
	signer: Signer
	isWallet: boolean
}) => {
	const owner = signer.address
	const now = useNow()
	const { run, pending } = useAction()
	const { data: labels } = useLabels()
	const { data: zone } = useZone()
	const { data: bono } = useBono(owner)
	const { data: charges } = useCharges(owner)
	const { data: wallet, isFetched: walletFetched } = useUsdcBalance(owner)
	const plateOf = usePlateLookup()
	const [amount, setAmount] = useState("20")

	const cars = labels?.filter((l) => l.label?.owner === owner) ?? []

	const deposit = () =>
		run(
			"deposit",
			async () =>
				send(
					await peaje.deposit({ owner, amount: parseUsdc(amount) }, as(signer)),
					signer,
				),
			`Bono recargado con ${amount} USDC`,
		)

	const withdraw = () =>
		run(
			"withdraw",
			async () =>
				send(
					await peaje.withdraw(
						{ owner, amount: parseUsdc(amount) },
						as(signer),
					),
					signer,
				),
			`Retirados ${amount} USDC del saldo libre`,
		)

	const appeal = (charge_id: bigint) =>
		run(
			`appeal-${charge_id}`,
			async () =>
				send(await peaje.appeal({ owner, charge_id }, as(signer)), signer),
			"Alegación presentada: el cargo queda en disputa hasta que decida el árbitro",
		)

	return (
		<>
			<div className="zbe-grid">
				<div className="card">
					<h2>Mi coche</h2>
					{cars.length === 0 ? (
						<p className="zbe-empty">
							Ninguna matrícula a tu nombre.{" "}
							{isWallet && (
								<>
									Pide a la <Link to="/dgt">DGT</Link> que emita la etiqueta de
									tu coche a tu wallet.
								</>
							)}
						</p>
					) : (
						cars.map((c) => (
							<div
								key={c.plate}
								className="zbe-row"
								style={{ marginBottom: 8 }}
							>
								<span className="zbe-plate">{c.plate}</span>
								<CategoryBadge value={c.label!.category} />
								{zone && (
									<span className="zbe-muted">
										{c.label!.category >= zone.min_category
											? "Entra gratis en la ZBE centro"
											: "No puede entrar gratis en la ZBE centro"}
									</span>
								)}
							</div>
						))
					)}
				</div>

				<div className="card">
					<h2>Bono ZBE</h2>
					<div
						className="zbe-row"
						style={{ gap: "2rem", marginBottom: "1rem" }}
					>
						<div>
							<div className="zbe-muted">Libre</div>
							<div className="zbe-stat-value">
								<Usdc amount={bono?.free} />
							</div>
						</div>
						<div>
							<div className="zbe-muted">Bloqueado</div>
							<div className="zbe-stat-value">
								<Usdc amount={bono?.locked} />
							</div>
						</div>
					</div>
					<p className="zbe-muted">
						En la cartera: <Usdc amount={wallet} />. Al recargar aceptas que, si
						entras sin etiqueta válida, se bloquee la tarifa y puedas alegar.
					</p>
					{walletFetched && wallet === null ? (
						isWallet ? (
							<button
								onClick={() =>
									run(
										"trust",
										() => addTrustline(signer),
										"USDC activado en tu wallet",
									)
								}
								disabled={!!pending}
							>
								Activar USDC en mi wallet
							</button>
						) : (
							<p className="zbe-danger">
								Esta cuenta no tiene trustline a USDC.
							</p>
						)
					) : (
						<div className="zbe-form">
							<label>
								Importe (USDC)
								<input
									type="number"
									min="1"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
								/>
							</label>
							<button onClick={deposit} disabled={!!pending}>
								Recargar
							</button>
							<button onClick={withdraw} disabled={!!pending}>
								Retirar libre
							</button>
						</div>
					)}
				</div>
			</div>

			<div className="card zbe-section">
				<h2>Mis cargos</h2>
				{!charges?.length ? (
					<p className="zbe-empty">Sin cargos.</p>
				) : (
					<div className="zbe-table-wrap">
						<table className="zbe-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Vehículo</th>
									<th>Zona</th>
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
										<td>{c.zone_id}</td>
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
											{c.status.tag === "Pending" && isOpen(c, now) && (
												<button
													onClick={() => appeal(c.id)}
													disabled={!!pending}
												>
													Alegar
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
		</>
	)
}

export default Conductor
