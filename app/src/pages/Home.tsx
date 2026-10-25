import {
	ArrowRight,
	Bank,
	Camera,
	Car,
	CaretRight,
	EyeSlash,
	Handshake,
	IdentificationCard,
	LockSimple,
	Scales,
} from "@phosphor-icons/react"
import { Link } from "react-router-dom"
import { formatUsdc, ZONE } from "../zbe/config"
import { useZone } from "../zbe/hooks"
import { CategoryBadge, ZbeSign } from "../zbe/ui"

const STEPS = [
	{
		to: "/conductor",
		title: "Top up a ZBE pass",
		text: "In the Driver view, as Lucía (label B), top up 20 USDC. This is the consent: without a pass she can never be charged.",
		link: "Open the driver view",
	},
	{
		to: "/camara",
		title: "A car enters the zone",
		text: "In the Camera view, pick 2222BCD and press “Car enters”. 5 USDC move from available to locked.",
		link: "Open the camera",
	},
	{
		to: "/ayuntamiento",
		title: "Appeal or collect",
		text: "Lucía can appeal while the countdown runs; the arbiter decides. Otherwise City Hall collects it.",
		link: "Open City Hall",
	},
]

const PRINCIPLES = [
	{
		Icon: Handshake,
		title: "Consent first",
		text: "Only drivers who top up a ZBE pass can be charged. No pass, no charge: the ordinary procedure applies.",
	},
	{
		Icon: LockSimple,
		title: "Locked, not taken",
		text: "The fee stays in the contract during the appeal window. Nobody can touch it early, not even the city.",
	},
	{
		Icon: Scales,
		title: "Always appealable",
		text: "An independent arbiter decides appeals. The city is never judge and party.",
	},
	{
		Icon: EyeSlash,
		title: "Private by design",
		text: "Only an HMAC of the plate goes on-chain, never the plate itself.",
	},
]

const ROLES = [
	{
		to: "/camara",
		Icon: Camera,
		title: "Camera",
		text: "Reports a plate entering the zone.",
	},
	{
		to: "/conductor",
		Icon: Car,
		title: "Driver",
		text: "Tops up the pass, follows charges and appeals.",
	},
	{
		to: "/ayuntamiento",
		Icon: Bank,
		title: "City Hall",
		text: "Sets the zone rules and collects due charges.",
	},
	{
		to: "/arbitro",
		Icon: Scales,
		title: "Arbiter",
		text: "Upholds or cancels appealed charges.",
	},
	{
		to: "/dgt",
		Icon: IdentificationCard,
		title: "DGT",
		text: "Issues and revokes environmental labels.",
	},
]

const Home = () => {
	const { data: zone } = useZone()
	// Categorías que entran gratis: de la mínima de la zona a Cero
	const free = zone ? [4, 3, 2, 1].filter((c) => c >= zone.min_category) : []

	return (
		<>
			<section className="zbe-hero" aria-labelledby="hero-title">
				<div>
					<h1 id="hero-title">
						A Low Emission Zone toll you opt into, and can always appeal.
					</h1>
					<p>
						Each car carries its DGT environmental label on Stellar. If a car
						without a valid label enters and its owner holds a{" "}
						<strong>ZBE pass</strong>, the daily fee is{" "}
						<strong>locked, not taken</strong>. It is only collected if nobody
						appeals in time. It is not an automatic fine.
					</p>
					<div className="zbe-hero-actions">
						<Link
							to="/conductor"
							className="zbe-link-button zbe-link-button--primary"
						>
							Start the demo
							<ArrowRight weight="bold" aria-hidden />
						</Link>
						<Link to="/camara" className="zbe-link-button">
							Open the camera
						</Link>
					</div>
				</div>

				<div className="zbe-road-sign" aria-label={`Rules of zone ${ZONE}`}>
					<div className="zbe-road-sign-inner">
						<div className="zbe-road-sign-head">
							<ZbeSign size={56} />
							<div>
								<strong>Low Emission Zone</strong>
								<span>Zone “{ZONE}” – rules read from the contract</span>
							</div>
						</div>
						<dl>
							<div>
								<dt>Free entry</dt>
								<dd>
									{zone
										? free.map((c) => <CategoryBadge key={c} value={c} />)
										: "…"}
								</dd>
							</div>
							<div>
								<dt>Other labels with a ZBE pass</dt>
								<dd>{zone ? `${formatUsdc(zone.fee)} per day` : "…"}</dd>
							</div>
							<div>
								<dt>Time to appeal</dt>
								<dd>
									{zone ? `${zone.appeal_secs.toString()} s in this demo` : "…"}
								</dd>
							</div>
							<div>
								<dt>Without a pass</dt>
								<dd>Nothing is charged</dd>
							</div>
						</dl>
					</div>
				</div>
			</section>

			<section className="zbe-home-section" aria-labelledby="steps-title">
				<h2 id="steps-title">Run the demo in three steps</h2>
				<p>
					Every role signs with its own demo key, so one person can play them
					all from this browser.
				</p>
				<ol className="zbe-steps">
					{STEPS.map((s) => (
						<li key={s.to}>
							<h3>{s.title}</h3>
							<p>{s.text}</p>
							<Link to={s.to}>
								{s.link}
								<ArrowRight weight="bold" aria-hidden />
							</Link>
						</li>
					))}
				</ol>
			</section>

			<section className="zbe-home-section" aria-labelledby="why-title">
				<h2 id="why-title">Why it is not a fine</h2>
				<p>
					A car is never charged without the owner&apos;s prior consent, and
					every charge can be contested before the money moves.
				</p>
				<dl className="zbe-principles">
					{PRINCIPLES.map(({ Icon, title, text }) => (
						<div key={title}>
							<Icon aria-hidden />
							<dt>{title}</dt>
							<dd>{text}</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="zbe-home-section" aria-labelledby="roles-title">
				<h2 id="roles-title">Who does what</h2>
				<p>Each role can only do its own part, and the contract enforces it.</p>
				<ul className="zbe-roles">
					{ROLES.map(({ to, Icon, title, text }) => (
						<li key={to}>
							<Link to={to}>
								<Icon aria-hidden />
								<strong>{title}</strong>
								<span>{text}</span>
								<CaretRight weight="bold" aria-hidden />
							</Link>
						</li>
					))}
				</ul>
			</section>
		</>
	)
}

export default Home
