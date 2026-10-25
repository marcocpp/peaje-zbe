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
	{ to: "/conductor", label: "Driver", icon: "🚗" },
	{ to: "/camara", label: "Camera", icon: "📷" },
	{ to: "/ayuntamiento", label: "City Hall", icon: "🏛️" },
	{ to: "/arbitro", label: "Arbiter", icon: "⚖️" },
	{ to: "/dgt", label: "DGT", icon: "🪪" },
]

const AppLayout = () => (
	<div className={styles.AppLayout}>
		<header className={styles.header}>
			<NavLink to="/" className={styles.logo}>
				<span className={styles.logoMark}>🌿</span>
				<span className={styles.logoText}>
					<strong>ZBE Toll</strong>
					<span>Low Emission Zones on Stellar</span>
				</span>
			</NavLink>
			<nav className={styles.headerNav}>
				{NAV.map((n) => (
					<NavLink
						key={n.to}
						to={n.to}
						className={({ isActive }) => (isActive ? styles.active : "")}
					>
						{n.icon} {n.label}
					</NavLink>
				))}
			</nav>
			<ConnectAccount />
		</header>

		<main className={styles.main}>
			<Outlet />
		</main>

		<footer className={styles.footer}>
			<nav className={styles.footerNav}>
				<span>HackMeridian 2026 · Team IMPEDANCIA UNO · Built on Stellar</span>
				<span className={styles.footerLinks}>
					<NavLink to="/debug">Contract Explorer</NavLink>
					<a href={labPrefix()} target="_blank" rel="noreferrer">
						Transaction Explorer
					</a>
				</span>
			</nav>
		</footer>
	</div>
)

export default App
