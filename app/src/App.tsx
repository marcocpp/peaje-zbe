import {
	Bank,
	Camera,
	Car,
	IdentificationCard,
	Scales,
} from "@phosphor-icons/react"
import { labPrefix } from "@stellar-scaffold/app-lib"
import { NavLink, Outlet, Route, Routes } from "react-router-dom"
import styles from "./App.module.css"
import ConnectAccount from "./components/ConnectAccount"
import Arbitro from "./pages/Arbitro"
import Ayuntamiento from "./pages/Ayuntamiento"
import Camara from "./pages/Camara"
import Conductor from "./pages/Conductor"
import Debug from "./pages/Debug"
import Dgt from "./pages/Dgt"
import Home from "./pages/Home"
import { ZbeSign } from "./zbe/ui"

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/conductor" element={<Conductor />} />
				<Route path="/camara" element={<Camara />} />
				<Route path="/ayuntamiento" element={<Ayuntamiento />} />
				<Route path="/arbitro" element={<Arbitro />} />
				<Route path="/dgt" element={<Dgt />} />
				<Route path="/debug" element={<Debug />} />
				<Route path="/debug/:contractName" element={<Debug />} />
			</Route>
		</Routes>
	)
}

const NAV = [
	{ to: "/camara", label: "Camera", Icon: Camera },
	{ to: "/conductor", label: "Driver", Icon: Car },
	{ to: "/ayuntamiento", label: "City Hall", Icon: Bank },
	{ to: "/arbitro", label: "Arbiter", Icon: Scales },
	{ to: "/dgt", label: "DGT", Icon: IdentificationCard },
]

const AppLayout = () => (
	<div className={styles.AppLayout}>
		<a href="#main" className={styles.skip}>
			Skip to content
		</a>
		<header className={styles.header}>
			<div className={styles.headerInner}>
				<NavLink to="/" className={styles.logo}>
					<ZbeSign size={34} />
					ZBE Toll
				</NavLink>
				<nav className={styles.headerNav} aria-label="Roles">
					{NAV.map(({ to, label, Icon }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) => (isActive ? styles.active : "")}
						>
							<Icon aria-hidden />
							{label}
						</NavLink>
					))}
				</nav>
				<ConnectAccount />
			</div>
		</header>

		<main id="main" className={styles.main}>
			<Outlet />
		</main>

		<footer className={styles.footer}>
			<div className={styles.footerNav}>
				<span>
					HackMeridian 2026 – Team IMPEDANCIA UNO – Built on Stellar – Test USDC
					only, no real value
				</span>
				<span className={styles.footerLinks}>
					<NavLink to="/debug">Contract Explorer</NavLink>
					<a href={labPrefix()} target="_blank" rel="noreferrer">
						Transaction Explorer
					</a>
				</span>
			</div>
		</footer>
	</div>
)

export default App
