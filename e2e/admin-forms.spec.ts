import { expect, mockRoute, test } from "./fixtures";

const ORG_SLUG = "SDC";
const BASE_URL = `/orgs/${ORG_SLUG}/forms`;

const draftForm1 = {
	id: "f1",
	title: "草稿表單一",
	status: "DRAFT",
	deadline: null,
	updatedAt: "2025-05-28T08:00:00Z",
	visibility: "PUBLIC"
};

const publishedForm = {
	id: "f2",
	title: "已發布表單",
	status: "PUBLISHED",
	deadline: "2099-07-01T00:00:00Z",
	updatedAt: "2025-06-01T10:00:00Z",
	visibility: "PUBLIC"
};

const draftForm2 = {
	id: "f3",
	title: "草稿表單二",
	status: "DRAFT",
	deadline: null,
	updatedAt: "2025-06-10T00:00:00Z",
	visibility: "PUBLIC"
};

const doneForm = {
	id: "f4",
	title: "已截止表單",
	status: "PUBLISHED",
	deadline: "2020-01-01T00:00:00Z",
	updatedAt: "2025-01-01T00:00:00Z",
	visibility: "PUBLIC"
};

const draftForm3 = {
	id: "f5",
	title: "草稿表單三",
	status: "DRAFT",
	deadline: null,
	updatedAt: "2025-06-15T00:00:00Z",
	visibility: "PUBLIC"
};

test("clicking 建立表單 POSTs to API and navigates to new form info page", async ({ page }) => {
	await mockRoute(page, `**/api/orgs/${ORG_SLUG}/forms`, []);

	const newForm = { id: "new-f1", title: "未命名表單", status: "DRAFT" };

	await page.route(`**/api/orgs/${ORG_SLUG}/forms`, async route => {
		if (route.request().method() === "POST") {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(newForm)
			});
		} else {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([])
			});
		}
	});

	await page.goto(BASE_URL);
	await page.waitForSelector("button:has-text('建立表單')");

	await page.click("button:has-text('建立表單')");

	await page.waitForURL(`**/orgs/${ORG_SLUG}/forms/new-f1/info`);
});

test("create form failure shows error toast and stays on forms page", async ({ page }) => {
	await mockRoute(page, `**/api/orgs/${ORG_SLUG}/forms`, []);

	await page.route(`**/api/orgs/${ORG_SLUG}/forms`, route => {
		if (route.request().method() === "POST") {
			route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({ message: "建立表單失敗" })
			});
		} else {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([])
			});
		}
	});

	await page.goto(BASE_URL);
	await page.waitForSelector("button:has-text('建立表單')");
	await page.click("button:has-text('建立表單')");

	await expect(page.getByText("錯誤", { exact: true }).first()).toBeVisible({ timeout: 5000 });

	expect(page.url()).toContain(`/orgs/${ORG_SLUG}/forms`);
	expect(page.url()).not.toContain("/info");
});

test("clicking a form card navigates to its info page", async ({ page }) => {
	await mockRoute(page, `**/api/orgs/${ORG_SLUG}/forms`, [publishedForm]);

	await page.goto(BASE_URL);
	await page.waitForSelector(`text=${publishedForm.title}`);

	await page.click(`text=${publishedForm.title}`);

	await page.waitForURL(`**/orgs/${ORG_SLUG}/forms/${publishedForm.id}/info`);
});

test("tab filtering works and filtered cards are still clickable", async ({ page }) => {
	const allForms = [draftForm1, publishedForm, draftForm2, doneForm, draftForm3];
	await mockRoute(page, `**/api/orgs/${ORG_SLUG}/forms`, allForms);

	await page.goto(BASE_URL);

	await page.waitForSelector(`text=${draftForm1.title}`);
	const initialCards = page.locator("[class*=cardTitle]");
	await expect(initialCards).toHaveCount(5);

	await page.click("button:has-text('草稿')");
	const draftCards = page.locator("[class*=cardTitle]");
	await expect(draftCards).toHaveCount(3);

	await page.click(`text=${draftForm1.title}`);
	await page.waitForURL(`**/orgs/${ORG_SLUG}/forms/${draftForm1.id}/info`);
});
