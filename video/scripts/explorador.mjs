// Captura transacciones confirmadas de testnet en stellar.expert
// Uso: node explorador.mjs nombre=hash [nombre=hash...]
import { chromium } from "playwright-core"

const OUT = new URL("../public/capturas/", import.meta.url).pathname
const browser = await chromium.launch({ executablePath: process.env.CHROME })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
for (const arg of process.argv.slice(2)) {
	const [name, hash] = arg.split("=")
	await page.goto(`https://stellar.expert/explorer/testnet/tx/${hash}`, {
		waitUntil: "networkidle",
	})
	await page
		.getByText(hash.slice(0, 12))
		.first()
		.waitFor({ timeout: 60_000 })
		.catch(() => {})
	await page.waitForTimeout(3000)
	// Despliega la invocación para ver los efectos (transferencias, eventos)
	await page.mouse.click(1597, 474)
	await page.waitForTimeout(3000)
	await page.screenshot({ path: `${OUT}${name}.png` })
	console.log("📸", name)
}
await browser.close()
