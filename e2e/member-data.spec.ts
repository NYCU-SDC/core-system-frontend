import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const FORM_ID = "member-form-1";
const FORM = {
	id: FORM_ID,
	title: "2026 招募資料",
	description: null,
	status: "DRAFT",
	visibility: "PUBLIC",
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z"
};

const VIEWS = [
	{ id: "view-1", title: "全部成員", locked: false, order: 0, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
	{ id: "view-2", title: "這是一個非常長的第二分頁名稱", locked: false, order: 1, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }
];

const fulfillJson = (page: Page, pattern: RegExp, body: unknown) =>
	page.route(pattern, route =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(body)
		})
	);

const mockMemberData = async (page: Page) => {
	await fulfillJson(page, /\/api\/orgs\/SDC\/forms(?:\?.*)?$/, [FORM]);
	await fulfillJson(page, new RegExp(`/api/forms/${FORM_ID}(?:\\?.*)?$`), FORM);
	await fulfillJson(page, new RegExp(`/api/forms/${FORM_ID}/views(?:\\?.*)?$`), VIEWS);
	await fulfillJson(page, new RegExp(`/api/forms/${FORM_ID}/sections(?:\\?.*)?$`), []);
	await fulfillJson(page, new RegExp(`/api/forms/${FORM_ID}/responses(?:\\?.*)?$`), { responses: [] });
	await fulfillJson(page, new RegExp(`/api/forms/${FORM_ID}/workflow(?:\\?.*)?$`), { workflow: [] });
};

test("member data uses the route form ID and supports keyboard view selection", async ({ page }) => {
	await mockMemberData(page);
	const requestedUrls: string[] = [];
	page.on("request", request => {
		if (request.url().includes("/api/forms/")) requestedUrls.push(request.url());
	});

	await page.goto(`/orgs/SDC/forms/${FORM_ID}/members`);
	await expect(page.getByRole("heading", { name: FORM.title })).toBeVisible();
	await expect.poll(() => requestedUrls.some(url => url.includes(`/api/forms/${FORM_ID}/views`))).toBe(true);

	await page.getByRole("button", { name: VIEWS[0].title }).click();
	const secondView = page.getByRole("option").filter({ hasText: VIEWS[1].title });
	await secondView.focus();
	await page.keyboard.press("Enter");

	await expect(page).toHaveURL(new RegExp(`[?&]view=${VIEWS[1].id}(?:&|$)`));
	await page.getByRole("button", { name: VIEWS[1].title }).click();
	const secondViewTitle = page.getByRole("option").filter({ hasText: VIEWS[1].title }).locator("span").filter({ hasText: VIEWS[1].title });
	await expect(secondViewTitle).toHaveCSS("text-overflow", "ellipsis");
});

test("legacy member route redirects to the first form in the active organization", async ({ page }) => {
	await mockMemberData(page);

	await page.goto("/orgs/SDC/members");

	await expect(page).toHaveURL(new RegExp(`/orgs/SDC/forms/${FORM_ID}/members`));
	await expect(page.getByRole("heading", { name: FORM.title })).toBeVisible();
});
