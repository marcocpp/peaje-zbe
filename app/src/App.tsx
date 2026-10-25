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
	{ to: "/conductor", label: "Conductor" },
	{ to: "/camara", label: "Cámara" },
	{ to: "/ayuntamiento", label: "Ayuntamiento" },
	{ to: "/arbitro", label: "Árbitro" },
	{ to: "/dgt", label: "DGT" },
]

const AppLayout = () => (
	<div className={styles.AppLayout}>
		<header className={styles.header}>
			<NavLink to="/" className={styles.logo}>
				Peaje ZBE
			</NavLink>
			<nav className={styles.headerNav}>
				{NAV.map((n) => (
					<NavLink
						key={n.to}
						to={n.to}
						className={({ isActive }) => (isActive ? styles.active : "")}
					>
						{n.label}
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
				<NavLink to="/debug">Contract Explorer</NavLink>
				<a href={labPrefix()} target="_blank" rel="noreferrer">
					Transaction Explorer
				</a>
				<span>HackMeridian 2026 · Stellar</span>
			</nav>
		</footer>
	</div>
)

export default App
