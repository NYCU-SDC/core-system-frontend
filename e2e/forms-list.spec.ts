/**
 * FormsListPage E2E tests (FL-INT-001 to FL-INT-005)
 *
 * These tests navigate to the real /forms page with the Vite dev server running
 * and mock all API calls via page.route().
 */
import { expect, mockRoute, test } from "./fixtures";

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
const formNotStarted = {
	id: "f1",
	title: "活動報名表",
	deadline: "2025-06-30T00:00:00Z",
	status: "NOT_STARTED",
	responseIds: []
};

const formInProgress = {
	id: "f2",
	title: "問卷調查",
	deadline: null,
	status: "IN_PROGRESS",
	responseIds: ["resp-2"]
};

const formCompleted = {
	id: "f3",
	title: "課程回饋",
	deadline: "2025-03-01T00:00:00Z",
	status: "COMPLETED",
	responseIds: ["resp-3"]
};

// ---------------------------------------------------------------------------
// FL-INT-001: NOT_STARTED → POST create response → navigate
// ---------------------------------------------------------------------------
test("FL-INT-001: clicking NOT_STARTED form creates a response and navigates", async ({ page }) => {
	await mockRoute(page, "**/api/unit/users/me/forms", [formNotStarted]);
	await mockRoute(page, "**/api/responses/forms/f1", { id: "resp-1" }, { method: "POST" });

	let postCalled = false;
	await page.route("**/api/responses/forms/f1", route => {
		if (route.request().method() === "POST") {
			postCalled = true;
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ id: "resp-1" })
			});
		} else {
			route.continue();
		}
	});

	await page.goto("/forms");
	await page.waitForSelector("text=活動報名表");

	await page.click("text=開始填寫");

	expect(postCalled).toBe(true);
	await page.waitForURL("**/forms/f1/resp-1");
});

// ---------------------------------------------------------------------------
// FL-INT-002: IN_PROGRESS with responseIds → navigate directly (no POST)
// ---------------------------------------------------------------------------
test("FL-INT-002: clicking IN_PROGRESS form with responseIds navigates directly without POST", async ({ page }) => {
	await mockRoute(page, "**/api/unit/users/me/forms", [formInProgress]);

	let postCalled = false;
	await page.route("**/api/responses/forms/f2", route => {
		if (route.request().method() === "POST") {
			postCalled = true;
			route.continue();
		} else {
			route.continue();
		}
	});

	await page.goto("/forms");
	// Switch to the 填寫中 tab
	await page.click("button:has-text('填寫中')");
	await page.waitForSelector("text=問卷調查");

	await page.click("text=繼續填寫");
	await page.waitForURL("**/forms/f2/resp-2");

	expect(postCalled).toBe(false);
});

// ---------------------------------------------------------------------------
// FL-INT-003: IN_PROGRESS with no responseIds → fallback GET → navigate
// ---------------------------------------------------------------------------
test("FL-INT-003: IN_PROGRESS form without responseIds fetches existing response then navigates", async ({ page }) => {
	const formNoIds = { ...formInProgress, id: "f3", title: "無ID問卷", responseIds: undefined };
	await mockRoute(page, "**/api/unit/users/me/forms", [formNoIds]);

	let getCalled = false;
	await page.route("**/api/responses/forms/f3", route => {
		if (route.request().method() === "GET") {
			getCalled = true;
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ responses: [{ id: "resp-3" }] })
			});
		} else {
			route.continue();
		}
	});

	await page.goto("/forms");
	await page.click("button:has-text('填寫中')");
	await page.waitForSelector("text=無ID問卷");

	await page.click("text=繼續填寫");

	expect(getCalled).toBe(true);
	await page.waitForURL("**/forms/f3/resp-3");
});

// ---------------------------------------------------------------------------
// FL-INT-004: POST create response fails → toast visible → button still clickable
// ---------------------------------------------------------------------------
test("FL-INT-004: create response failure shows error toast and keeps button enabled", async ({ page }) => {
	await mockRoute(page, "**/api/unit/users/me/forms", [formNotStarted]);
	await page.route("**/api/responses/forms/f1", route => {
		if (route.request().method() === "POST") {
			route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({ message: "Server Error" })
			});
		} else {
			route.continue();
		}
	});

	await page.goto("/forms");
	await page.waitForSelector("text=活動報名表");

	await page.click("text=開始填寫");

	// Wait for error toast
	const toast = page.locator('[role="alert"], [data-sonner-toast], .toast, [class*="toast"]').first();
	await expect(toast).toBeVisible({ timeout: 5000 });

	// Button should still be in the DOM and interactable
	const btn = page.locator("button:has-text('開始填寫')").first();
	await expect(btn).toBeVisible();
	await expect(btn).not.toBeDisabled();
});

// ---------------------------------------------------------------------------
// FL-INT-005: 「前往組織後台」 button navigates to admin
// ---------------------------------------------------------------------------
test("FL-INT-005: admin button navigates to org admin forms page", async ({ page }) => {
	// withAuth fixture already mocks /api/unit/orgs to return [{ slug: "SDC" }]
	await mockRoute(page, "**/api/unit/users/me/forms", []);
	// Mock org admin access: useOrgAdminAccess checks user + orgs (already mocked by fixture)

	await page.goto("/forms");

	// The button appears when user has org admin access (orgs.length > 0 + user exists)
	const adminBtn = page.locator("button:has-text('前往組織後台')");
	await expect(adminBtn).toBeVisible({ timeout: 5000 });

	await adminBtn.click();

	// Cross-entry navigation: since orgs route is served by admin.html,
	// the app does a hard navigation — wait for URL change
	await page.waitForURL("**/orgs/SDC/forms", { timeout: 10000 });
});
