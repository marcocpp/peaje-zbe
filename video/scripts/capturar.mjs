// Recorre la demo real en testnet y guarda capturas 1920x1080 y un clip.
// Uso: node video/scripts/capturar.mjs (con la web de testnet en :4173)
import { chromium } from "playwright-core"
import { mkdirSync, writeFileSync } from "node:fs"

const BASE = process.env.BASE ?? "http://localhost:4173"
const OUT = new URL("../public/capturas/", import.meta.url).pathname
const CLIPS = new URL("../public/clips/", import.meta.url).pathname
const PLATE2 = process.env.PLATE2 ?? "4444BCD"
mkdirSync(OUT, { recursive: true })
mkdirSync(CLIPS, { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROME })
const ctx = await browser.newContext({
	viewport: { width: 1920, height: 1080 },
	recordVideo: { dir: CLIPS, size: { width: 1920, height: 1080 } },
})
const page = await ctx.newPage()
const log = []
const t0 = Date.now()
const mark = (name) => log.push({ name, t: (Date.now() - t0) / 1000 })

const FROM = Number(process.env.FROM ?? 0)
const shot = async (name) => {
	await page.waitForTimeout(600)
	await page.screenshot({ path: `${OUT}${name}.png` })
	mark(name)
	console.log("📸", name)
}
const go = async (path) => {
	await page.goto(BASE + path)
	await page.locator("main h1").waitFor()
	await page.waitForTimeout(3500)
}
const btn = (name) => page.getByRole("button", { name, exact: true })
const text = (t) => page.getByText(t).first().waitFor({ timeout: 90_000 })

if (FROM < 10) {
	await go("/")
	await shot("01-home")

	await go("/dgt")
	await shot("02-dgt-etiquetas")

	await go("/conductor")
	await shot("03-conductor-vacio")
	await page.getByLabel("Amount (USDC)").fill("20")
	await btn("Top up").click()
	await page
		.locator("dd", { hasText: "20 USDC" })
		.first()
		.waitFor({ timeout: 90_000 })
	await shot("04-conductor-bono-20")

	await go("/camara")
	await page.getByLabel("Known plate").selectOption({ index: 1 })
	await btn("Car enters").click()
	await text(/Charge #\d+ locked/)
	await shot("05-camara-cargo-bloqueado")
	await page.getByLabel("Known plate").selectOption({ index: 0 })
	await btn("Car enters").click()
	await text("Access granted")
	await page.getByLabel("Known plate").selectOption({ index: 2 })
	await btn("Car enters").click()
	await text("No ZBE pass or not enough balance")
	await shot("06-camara-tres-coches")

	await go("/conductor")
	await shot("07-conductor-cargo-cuenta-atras")

	await go("/ayuntamiento")
	await shot("08-ayuntamiento-pendiente")
	await btn("Collect").waitFor({ timeout: 120_000 })
	await shot("09-ayuntamiento-plazo-vencido")
	await btn("Collect").click()
	await page
		.locator("tbody")
		.getByText("Collected", { exact: true })
		.first()
		.waitFor({ timeout: 90_000 })
	await page.waitForTimeout(3500)
	await shot("10-ayuntamiento-cobrado")
} else {
	await go("/ayuntamiento")
	await shot("10-ayuntamiento-cobrado")
}

// Camino de alegación
await go("/dgt")
await page.getByLabel("Plate").fill(PLATE2)
await btn("Issue label").click()
await page.locator("table", { hasText: PLATE2 }).waitFor({ timeout: 90_000 })
await shot("11-dgt-nueva-etiqueta")

await go("/camara")
await page.getByLabel("Or type any plate").fill(PLATE2)
await btn("Car enters").click()
await text(/Charge #\d+ locked/)

await go("/conductor")
await btn("Appeal").waitFor({ timeout: 60_000 })
await shot("12-conductor-antes-de-alegar")
await btn("Appeal").click()
await page
	.locator("tbody")
	.getByText("Under appeal", { exact: true })
	.first()
	.waitFor({ timeout: 90_000 })
await page.waitForTimeout(2000)
await shot("13-conductor-alegado")

await go("/arbitro")
await shot("14-arbitro-pendiente")
await btn("Cancel and refund").click()
await page
	.getByRole("cell", { name: /Cancelled/ })
	.first()
	.waitFor({ timeout: 90_000 })
await page.waitForTimeout(3500)
await shot("15-arbitro-anulado")

await go("/conductor")
await shot("16-conductor-devuelto")

const video = page.video()
await ctx.close()
await video.saveAs(`${CLIPS}recorrido.webm`)
await video.delete()
writeFileSync(`${OUT}marcas.json`, JSON.stringify(log, null, 2))
await browser.close()
console.log("✅ listo")
