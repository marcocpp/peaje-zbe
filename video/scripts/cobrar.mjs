// Repite solo el paso "City Hall → Collect" y su captura (10)
import { chromium } from "playwright-core"

const OUT = new URL("../public/capturas/", import.meta.url).pathname
const browser = await chromium.launch({ executablePath: process.env.CHROME })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.goto((process.env.BASE ?? "http://localhost:4173") + "/ayuntamiento")
const collect = page.getByRole("button", { name: "Collect", exact: true })
await collect.waitFor({ timeout: 60_000 })
await page.waitForTimeout(1500)
await collect.click()
await page
	.locator("tbody")
	.getByText("Collected", { exact: true })
	.waitFor({ timeout: 90_000 })
await page.waitForTimeout(3500)
await page.screenshot({ path: `${OUT}10-ayuntamiento-cobrado.png` })
await browser.close()
console.log("📸 10-ayuntamiento-cobrado")
