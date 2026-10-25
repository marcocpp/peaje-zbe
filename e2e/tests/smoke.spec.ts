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
		page.getByRole("heading", {
			name: "A fair, opt-in toll for Low Emission Zones",
		}),
	).toBeVisible()
	for (const view of ["Driver", "Camera", "City Hall", "Arbiter", "DGT"]) {
		await expect(page.getByRole("link", { name: view }).first()).toBeVisible()
	}
})
