import { test, expect } from "@playwright/test"

test("home page mounts", async ({ page }) => {
	const response = await page.goto("/")
	expect(response?.ok()).toBeTruthy()
	await expect(page.locator("body")).toBeVisible()
})

test("wallet connect button is present", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByRole("button", { name: /connect/i })).toBeVisible()
})

test("contract explorer link is present", async ({ page }) => {
	await page.goto("/")
	await expect(page.locator('a[href="/debug"]').first()).toBeVisible()
})

test("ZBE home and views are linked", async ({ page }) => {
	await page.goto("/")
	await expect(
		page.getByRole("heading", { name: "Peaje ZBE en Stellar" }),
	).toBeVisible()
	for (const view of [
		"Conductor",
		"Cámara",
		"Ayuntamiento",
		"Árbitro",
		"DGT",
	]) {
		await expect(page.getByRole("link", { name: view }).first()).toBeVisible()
	}
})
