import { etiqueta } from "@stellar-scaffold/app-lib/clients"
import { useState } from "react"
import { useWallet } from "../hooks/useWallet"
import { CATEGORIES, DEMO_DRIVERS, demoSigner, UNIT } from "../zbe/config"
import { as, send } from "../zbe/contracts"
import { useAction, useLabels, useUsdcBalance } from "../zbe/hooks"
import { normalizePlate, plateHash, rememberPlate } from "../zbe/plates"
import { addTrustline, mintUsdc } from "../zbe/token"
import {
	CategoryBadge,
	MissingKeys,
	PageHead,
	Plate,
	Usdc,
	Who,
} from "../zbe/ui"

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
		...(address ? [{ address, label: "My wallet" }] : []),
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
			`Label issued for ${normalizePlate(plate)}`,
		)

	const revoke = (p: string) =>
		window.confirm(`Revoke the label of ${p}? This cannot be undone.`) &&
		run(
			`revoke-${p}`,
			async () => {
				if (!dgt) return
				await send(
					await etiqueta.revoke({ plate_hash: await plateHash(p) }, as(dgt)),
					dgt,
				)
			},
			`Label for ${p} revoked`,
		)

	return (
		<div>
			<PageHead
				icon="🪪"
				title="DGT · Environmental labels"
				signer={dgt?.label}
			>
				The DGT (Spain&apos;s traffic authority) is the only issuer. The label
				is bound to the vehicle: the owner cannot transfer it, only the DGT can
				reassign or revoke it.
			</PageHead>

			{!dgt && <MissingKeys who="DGT (me)" />}

			<div className="card zbe-section">
				<h2>Issue a label</h2>
				<div className="zbe-form">
					<label>
						Plate
						<input
							value={plate}
							onChange={(e) => setPlate(e.target.value)}
							placeholder="4444BCD"
						/>
					</label>
					<label>
						Owner
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
						Label
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
						className="zbe-btn-primary"
						onClick={issue}
						disabled={
							!dgt || !!pending || !normalizePlate(plate) || !ownerAddress
						}
					>
						Issue label
					</button>
				</div>
			</div>

			<div className="card zbe-section">
				<h2>Registry</h2>
				<div className="zbe-table-wrap">
					<table className="zbe-table">
						<thead>
							<tr>
								<th>Plate</th>
								<th>Label</th>
								<th>Owner</th>
								<th>On-chain key (HMAC)</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{(labels ?? []).map((l) => (
								<tr key={l.plate}>
									<td>
										<Plate plate={l.plate} />
									</td>
									<td>
										{l.label ? (
											<CategoryBadge value={l.label.category} />
										) : (
											<span className="zbe-muted">no label</span>
										)}
									</td>
									<td>{l.label && <Who address={l.label.owner} />}</td>
									<td>
										<code title={l.hash}>{l.hash.slice(0, 16)}…</code>
									</td>
									<td>
										{l.label && (
											<button
												className="zbe-btn-danger"
												onClick={() => revoke(l.plate)}
												disabled={!dgt || !!pending}
											>
												Revoke
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{address && (
				<div className="card zbe-section">
					<h2>Test USDC for my wallet</h2>
					<p className="zbe-muted">
						Balance: <Usdc amount={walletUsdc} />. Test token only, no real
						value.
					</p>
					{isFetched && walletUsdc === null ? (
						<button
							className="zbe-btn-primary"
							onClick={() =>
								run(
									"trust",
									() =>
										addTrustline({
											address,
											label: "My wallet",
											signTransaction,
										}),
									"USDC enabled in your wallet",
								)
							}
							disabled={!!pending}
						>
							1 · Enable USDC (your wallet signs)
						</button>
					) : (
						<button
							className="zbe-btn-primary"
							onClick={() =>
								run(
									"mint",
									async () => dgt && mintUsdc(dgt, address, 50n * UNIT),
									"50 USDC sent to your wallet",
								)
							}
							disabled={!dgt || !!pending}
						>
							Get 50 USDC
						</button>
					)}
				</div>
			)}
		</div>
	)
}

export default Dgt
