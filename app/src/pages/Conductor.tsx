import {
	CheckCircle,
	LockSimple,
	Prohibit,
	Wallet,
} from "@phosphor-icons/react"
import { peaje } from "@stellar-scaffold/app-lib/clients"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useWallet } from "../hooks/useWallet"
import {
	DEMO_DRIVERS,
	type DemoName,
	demoSigner,
	formatUsdc,
	parseUsdc,
	type Signer,
	ZONE,
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
			<PageHead title="Driver" signer={signer?.label}>
				Your car&apos;s environmental label, your ZBE pass and every charge with
				its appeal countdown.
			</PageHead>

			<label className="zbe-inline-select">
				View as
				<select value={who} onChange={(e) => setWho(e.target.value)}>
					{address && <option value={WALLET}>My wallet (Freighter)</option>}
					{DEMO_DRIVERS.map((d) => (
						<option key={d} value={d}>
							{demoSigner(d)?.label ?? d}
						</option>
					))}
				</select>
			</label>

			{signer ? (
				<DriverPanel
					key={signer.address}
					signer={signer}
					isWallet={who === WALLET}
				/>
			) : (
				<div className="zbe-notice" role="alert">
					<Wallet weight="bold" aria-hidden />
					<p>
						Connect your wallet or run <code>scripts/zbe-setup.sh</code> to get
						demo drivers.
					</p>
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
								<div key={c.plate} className="zbe-vehicle">
									<div className="zbe-row">
										<Plate plate={c.plate} />
										<CategoryBadge value={c.label!.category} withName />
									</div>
									{zone &&
										(allowed ? (
											<span className="zbe-allowed zbe-allowed--yes">
												<CheckCircle weight="bold" aria-hidden />
												Enters zone {ZONE} for free
											</span>
										) : (
											<span className="zbe-allowed zbe-allowed--no">
												<Prohibit weight="bold" aria-hidden />
												Not free in zone {ZONE}: with a ZBE pass,{" "}
												{formatUsdc(zone.fee)} a day is locked
											</span>
										))}
								</div>
							)
						})
					)}
				</div>

				<div className="card">
					<h2>ZBE pass</h2>
					<dl className="zbe-balances">
						<div className="zbe-balance zbe-balance--free">
							<dt>
								<Wallet weight="bold" aria-hidden />
								Available
							</dt>
							<dd>
								<Usdc amount={bono?.free} />
							</dd>
						</div>
						<div className="zbe-balance zbe-balance--locked">
							<dt>
								<LockSimple weight="bold" aria-hidden />
								Locked
							</dt>
							<dd>
								<Usdc amount={bono?.locked} />
							</dd>
						</div>
					</dl>
					<p className="zbe-muted zbe-pass-note">
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
									inputMode="decimal"
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
								Withdraw
							</button>
						</div>
					)}
				</div>
			</div>

			<div className="card zbe-section">
				<h2>My charges</h2>
				{!charges?.length ? (
					<p className="zbe-empty">
						No charges yet. Entries with an allowed label are never charged.
					</p>
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
										<td data-label="Zone">{c.zone_id}</td>
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
											{c.status.tag === "Pending" && isOpen(c, now) && (
												<button
													className="zbe-btn-secondary zbe-btn-small"
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
