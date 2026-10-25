import React from "react"
import { Link } from "react-router-dom"
import { categoryName, formatUsdc, ZONE } from "../zbe/config"
import { useZone } from "../zbe/hooks"

const ROLES = [
	{
		to: "/conductor",
		icon: "🚗",
		title: "Driver",
		text: "See your car's label, top up your ZBE pass and appeal a charge before the deadline.",
	},
	{
		to: "/camara",
		icon: "📷",
		title: "Camera",
		text: "Simulate an authorized camera: pick a plate and press “Car enters”.",
	},
	{
		to: "/ayuntamiento",
		icon: "🏛️",
		title: "City Hall",
		text: "Set the zone rules, follow every charge and collect the ones whose window closed.",
	},
	{
		to: "/arbitro",
		icon: "⚖️",
		title: "Arbiter",
		text: "An independent party resolves appeals: uphold the charge or cancel it.",
	},
	{
		to: "/dgt",
		icon: "🪪",
		title: "DGT",
		text: "The traffic authority issues and revokes labels, and hands out test USDC.",
	},
]

const PILLARS = [
	{
		icon: "🤝",
		title: "Consent first",
		text: "Only drivers who top up a pass can be charged. No pass, no charge.",
	},
	{
		icon: "🔒",
		title: "Funds nobody can touch early",
		text: "The fee stays locked in the contract until the window closes.",
	},
	{
		icon: "⚖️",
		title: "Always appealable",
		text: "An independent arbiter decides. The city is never judge and party.",
	},
	{
		icon: "🕶️",
		title: "Private by design",
		text: "Only an HMAC of the plate goes on-chain, never the plate itself.",
	},
]

const Home: React.FC = () => {
	const { data: zone } = useZone()
	const fee = zone ? formatUsdc(zone.fee) : "The daily fee"
	const minCategory = zone ? categoryName(zone.min_category) : "Eco"

	return (
		<div>
			<section className="zbe-hero">
				<span className="zbe-hero-kicker">HackMeridian 2026 · Stellar</span>
				<h1>A fair, opt-in toll for Low Emission Zones</h1>
				<p>
					Every car carries its environmental label as a non-transferable token.
					If it enters a zone its label doesn&apos;t allow and the owner holds a{" "}
					<strong>ZBE pass</strong>, the contract <strong>locks</strong> the
					fee, opens an <strong>appeal window</strong>, and only collects it if
					nobody appeals. It is not an automatic fine.
				</p>
				<div className="zbe-hero-actions">
					<Link to="/conductor" className="zbe-hero-primary">
						Start the demo →
					</Link>
					<Link to="/camara" className="zbe-hero-secondary">
						Open the camera
					</Link>
				</div>
			</section>

			<section className="zbe-pills">
				{PILLARS.map((p) => (
					<div key={p.title} className="card zbe-pill">
						<span className="zbe-pill-icon">{p.icon}</span>
						<div>
							<strong>{p.title}</strong>
							<span className="zbe-muted">{p.text}</span>
						</div>
					</div>
				))}
			</section>

			<h2 className="zbe-section-title">Try every role</h2>
			<section className="zbe-roles">
				{ROLES.map((r) => (
					<Link key={r.to} to={r.to} className="card zbe-role">
						<span className="zbe-page-icon">{r.icon}</span>
						<h3>{r.title}</h3>
						<p>{r.text}</p>
						<span className="zbe-role-open">Open →</span>
					</Link>
				))}
			</section>

			<h2 className="zbe-section-title">What happens when a car enters</h2>
			<div className="card">
				<ol className="zbe-steps">
					<li>
						<strong>Camera reports</strong>
						The plate&apos;s HMAC is sent for the zone <code>{ZONE}</code>,
						which admits {minCategory} and cleaner for free.
					</li>
					<li>
						<strong>Allowed label?</strong>
						Nothing happens and nothing is stored.
					</li>
					<li>
						<strong>No pass or no balance</strong>
						Nothing is charged. A <code>no_bono</code> event hands the case to
						the ordinary off-chain procedure.
					</li>
					<li>
						<strong>Pass with balance</strong>
						{fee} move from available to locked and the appeal window opens
						{zone && <> ({zone.appeal_secs.toString()}s in this demo)</>}.
					</li>
					<li>
						<strong>Collect or appeal</strong>
						No appeal: anyone can settle it to the treasury. Appeal: only the
						arbiter decides.
					</li>
					<li>
						<strong>Once a day</strong>
						At most one charge per vehicle, zone and day.
					</li>
				</ol>
			</div>
		</div>
	)
}

export default Home
