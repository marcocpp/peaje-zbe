import React from "react"
import { Link } from "react-router-dom"
import { categoryName, formatUsdc, ZONE } from "../zbe/config"
import { useZone } from "../zbe/hooks"
import "../zbe/zbe.css"
import styles from "./Home.module.css"

const VIEWS = [
	{
		to: "/conductor",
		title: "Conductor",
		text: "Tu etiqueta, el bono ZBE (libre y bloqueado) y tus cargos con botón para alegar.",
	},
	{
		to: "/camara",
		title: "Cámara",
		text: "Elige una matrícula y pulsa «Coche entra» para simular la lectura.",
	},
	{
		to: "/ayuntamiento",
		title: "Ayuntamiento",
		text: "Reglas de la zona, cargos, cobro tras el plazo y recaudación.",
	},
	{
		to: "/arbitro",
		title: "Árbitro",
		text: "Resuelve las alegaciones: confirma el cargo o lo anula.",
	},
	{
		to: "/dgt",
		title: "DGT",
		text: "Emite y retira etiquetas ambientales. Da USDC de prueba a tu wallet.",
	},
]

const Home: React.FC = () => {
	const { data: zone } = useZone()
	return (
		<div className={styles.Home}>
			<div>
				<h1>Peaje ZBE en Stellar</h1>
				<p>
					Peaje automático y <strong>voluntario</strong> para Zonas de Bajas
					Emisiones. Si tu etiqueta no te permite entrar y tienes bono, se
					bloquea la tarifa, puedes alegar y solo se cobra si nadie alega. No es
					una multa automática.
				</p>
			</div>

			<section className={`zbe-grid zbe-nav-cards`}>
				{VIEWS.map((v) => (
					<Link key={v.to} to={v.to}>
						<div className="card">
							<h2>{v.title}</h2>
							<p className="zbe-muted">{v.text}</p>
						</div>
					</Link>
				))}
			</section>

			<div className="card">
				<h2>Cómo funciona una entrada</h2>
				<ol className="zbe-steps">
					<li>
						La cámara reporta la matrícula (solo su HMAC) en la zona{" "}
						<strong>{ZONE}</strong>
						{zone && (
							<>
								, que admite gratis {categoryName(zone.min_category)} y
								superiores
							</>
						)}
						.
					</li>
					<li>Etiqueta permitida → no pasa nada.</li>
					<li>
						No permitida y sin bono o sin saldo → evento <code>no_bono</code>:
						procedimiento ordinario fuera de la cadena.
					</li>
					<li>
						No permitida y con bono → se bloquean{" "}
						{zone ? formatUsdc(zone.fee) : "la tarifa"} y empieza el plazo de
						alegación
						{zone && <> ({zone.appeal_secs.toString()} s en la demo)</>}.
					</li>
					<li>
						Sin alegación → cualquiera puede cobrarlo (<code>settle</code>) y va
						a la tesorería. Con alegación → solo el árbitro decide.
					</li>
					<li>Un solo cargo por vehículo, zona y día.</li>
				</ol>
			</div>
		</div>
	)
}

export default Home
