import { expect, test } from "@playwright/test";

test("建立表單並編輯基本資訊", async ({ page }) => {
	let orgSlug = process.env.E2E_ORG_SLUG;
	const uniqueSuffix = Date.now();
	const title = `E2E 建立表單 ${uniqueSuffix}`;
	const description = `這是 e2e 測試建立的表單描述 ${uniqueSuffix}`;
	const confirmMessage = `感謝填寫（${uniqueSuffix}）`;
	const startDate = "2026-05-01";
	const endDate = "2026-06-30";

	if (!orgSlug) {
		await page.goto("/orgs");
		await expect(page).toHaveURL(/\/orgs\/[^/]+\/forms$/);
		const matched = page.url().match(/\/orgs\/([^/]+)\/forms$/);
		expect(matched).not.toBeNull();
		orgSlug = matched?.[1];
	}

	await page.goto(`/orgs/${orgSlug}/forms`);

	await expect(page.getByRole("button", { name: "建立表單" })).toBeVisible({ timeout: 15000 });
	await page.getByRole("button", { name: "建立表單" }).click();

	await expect(page).toHaveURL(new RegExp(`/orgs/${orgSlug}/forms/[^/]+/info$`));

	const titleInput = page.getByPlaceholder("輸入表單標題");
	const descriptionInput = page.getByPlaceholder("輸入表單描述");
	const confirmMessageInput = page.getByPlaceholder("輸入表單提交後顯示的訊息");
	const startDateInput = page.locator('div:has(> label:has-text("開始日期")) input[type="date"]');
	const endDateInput = page.locator('div:has(> label:has-text("結束日期")) input[type="date"]');

	await titleInput.fill(title);
	await descriptionInput.fill(description);
	await confirmMessageInput.fill(confirmMessage);
	await startDateInput.fill(startDate);
	await endDateInput.fill(endDate);

	const saveStatus = page.locator('div[aria-live="polite"] span');
	await expect(saveStatus).toBeVisible();

	await expect(titleInput).toHaveValue(title);
	await expect(descriptionInput).toHaveValue(description);
	await expect(confirmMessageInput).toHaveValue(confirmMessage);
	await expect(startDateInput).toHaveValue(startDate);
	await expect(endDateInput).toHaveValue(endDate);
});
