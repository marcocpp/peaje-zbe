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
	PageHead,
	Plate,
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
				? { address, label: "My wallet", signTransaction }
				: undefined
			: demoSigner(who as DemoName)

	return (
		<div>
			<PageHead icon="🚗" title="Driver" signer={signer?.label}>
				Your car&apos;s environmental label, your ZBE pass and every charge with
				its appeal countdown.
			</PageHead>

			<div className="zbe-row zbe-section">
				<span className="zbe-muted">View as</span>
				<select value={who} onChange={(e) => setWho(e.target.value)}>
					{address && <option value={WALLET}>My wallet (Freighter)</option>}
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
					Connect your wallet or run <code>scripts/zbe-setup.sh</code> to get
					demo drivers.
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
			`ZBE pass topped up with ${amount} USDC`,
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
			`${amount} USDC withdrawn from your available balance`,
		)

	const appeal = (charge_id: bigint) =>
		run(
			`appeal-${charge_id}`,
			async () =>
				send(await peaje.appeal({ owner, charge_id }, as(signer)), signer),
			"Appeal filed: the charge stays locked until the arbiter decides",
		)

	return (
		<>
			<div className="zbe-grid">
				<div className="card">
					<h2>My vehicles</h2>
					{cars.length === 0 ? (
						<p className="zbe-empty">
							No vehicle registered to this account.{" "}
							{isWallet && (
								<>
									Ask the <Link to="/dgt">DGT</Link> to issue your car&apos;s
									label to your wallet.
								</>
							)}
						</p>
					) : (
						cars.map((c) => {
							const allowed = zone && c.label!.category >= zone.min_category
							return (
								<div
									key={c.plate}
									className="zbe-row"
									style={{ marginBottom: 10 }}
								>
									<Plate plate={c.plate} />
									<CategoryBadge value={c.label!.category} />
									{zone && (
										<span className="zbe-muted">
											{allowed
												? "✅ Enters the centro zone for free"
												: "⛔ Not allowed for free in the centro zone"}
										</span>
									)}
								</div>
							)
						})
					)}
				</div>

				<div className="card">
					<h2>ZBE pass</h2>
					<div className="zbe-balances">
						<div className="zbe-balance zbe-balance--free">
							<div className="zbe-stat-label">Available</div>
							<div className="zbe-stat-value">
								<Usdc amount={bono?.free} />
							</div>
						</div>
						<div className="zbe-balance zbe-balance--locked">
							<div className="zbe-stat-label">Locked</div>
							<div className="zbe-stat-value">
								<Usdc amount={bono?.locked} />
							</div>
						</div>
					</div>
					<p className="zbe-muted" style={{ marginTop: 0 }}>
						In your wallet: <Usdc amount={wallet} />. By topping up you agree
						that, if you enter without a valid label, the fee is locked and you
						can appeal it.
					</p>
					{walletFetched && wallet === null ? (
						isWallet ? (
							<button
								className="zbe-btn-primary"
								onClick={() =>
									run(
										"trust",
										() => addTrustline(signer),
										"USDC enabled in your wallet",
									)
								}
								disabled={!!pending}
							>
								Enable USDC in my wallet
							</button>
						) : (
							<p className="zbe-danger">This account has no USDC trustline.</p>
						)
					) : (
						<div className="zbe-form">
							<label>
								Amount (USDC)
								<input
									type="number"
									min="1"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
								/>
							</label>
							<button
								className="zbe-btn-primary"
								onClick={deposit}
								disabled={!!pending}
							>
								Top up
							</button>
							<button onClick={withdraw} disabled={!!pending}>
								Withdraw available
							</button>
						</div>
					)}
				</div>
			</div>

			<div className="card zbe-section">
				<h2>My charges</h2>
				{!charges?.length ? (
					<p className="zbe-empty">No charges yet. 🎉</p>
				) : (
					<div className="zbe-table-wrap">
						<table className="zbe-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Vehicle</th>
									<th>Zone</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Deadline</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{charges.map((c) => (
									<tr key={c.id.toString()}>
										<td>{c.id.toString()}</td>
										<td>
											<Plate plate={plateOf(c.plate_hash.toString("hex"))} />
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
													className="zbe-btn-danger"
													onClick={() => appeal(c.id)}
													disabled={!!pending}
												>
													Appeal
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
