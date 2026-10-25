// Graba un clip real: la cámara registra 5555BCD y el conductor ve la cuenta atrás.
// Antes hay que emitir la etiqueta de 5555BCD (DGT) para Lucía.
import { chromium } from "playwright-core"

const BASE = process.env.BASE ?? "http://localhost:4173"
const PLATE = process.env.PLATE ?? "5555BCD"
const DIR = new URL("../public/clips/", import.meta.url).pathname
const browser = await chromium.launch({ executablePath: process.env.CHROME })
const ctx = await browser.newContext({
	viewport: { width: 1920, height: 1080 },
	recordVideo: { dir: DIR, size: { width: 1920, height: 1080 } },
})
const page = await ctx.newPage()
const t0 = Date.now()
const marks = {}
await page.goto(BASE + "/camara")
await page.locator("main h1").waitFor()
await page.waitForTimeout(3000)
marks.listo = (Date.now() - t0) / 1000
await page.getByLabel("Or type any plate").fill("")
await page
	.getByLabel("Or type any plate")
	.pressSequentially(PLATE, { delay: 120 })
await page.waitForTimeout(600)
marks.clic = (Date.now() - t0) / 1000
await page.getByRole("button", { name: "Car enters", exact: true }).click()
await page
	.getByText(/Charge #\d+ locked/)
	.first()
	.waitFor({ timeout: 90_000 })
marks.cargo = (Date.now() - t0) / 1000
await page.waitForTimeout(3000)
await page.goto(BASE + "/conductor")
await page
	.getByRole("button", { name: "Appeal", exact: true })
	.waitFor({ timeout: 60_000 })
marks.conductor = (Date.now() - t0) / 1000
await page.waitForTimeout(6000)
marks.fin = (Date.now() - t0) / 1000
const v = page.video()
await ctx.close()
await v.saveAs(DIR + "entrada-camara.webm")
await v.delete()
await browser.close()
console.log(JSON.stringify(marks))
