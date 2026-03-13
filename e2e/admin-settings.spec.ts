import { expect, mockOrg, mockRoute, test } from "./fixtures";

const ORG_SLUG = "SDC";
const BASE_URL = `/orgs/${ORG_SLUG}/settings`;

const orgData = { ...mockOrg, name: "原始名稱" };

const memberAlice = { id: "m1", name: "Alice", emails: ["alice@example.com"], avatarUrl: "" };
const memberBob = { id: "m2", name: "Bob", emails: ["bob@example.com"], avatarUrl: "" };
const memberCarol = { id: "m3", name: "Carol", emails: ["carol@example.com"], avatarUrl: "" };

test("AS-INT-001: updating org name and pressing Enter sends PUT and shows success toast", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}/members`, []);

	let capturedBody: unknown = null;
	await page.route(`**/api/unit/orgs/${ORG_SLUG}`, route => {
		if (route.request().method() === "PUT") {
			route
				.request()
				.postDataJSON()
				.then((body: unknown) => {
					capturedBody = body;
				})
				.catch(() => {});
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ ...orgData, name: "新名稱" })
			});
		} else {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(orgData)
			});
		}
	});

	await page.goto(BASE_URL);

	const orgInput = page.locator("#orgName");
	await expect(orgInput).toHaveValue("原始名稱", { timeout: 5000 });

	await orgInput.click({ clickCount: 3 });
	await orgInput.type("新名稱");
	await orgInput.press("Enter");

	await expect(page.locator("text=編輯成功")).toBeVisible({ timeout: 5000 });
});

test("AS-INT-002: org name PUT failure shows error toast", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}/members`, []);

	await page.route(`**/api/unit/orgs/${ORG_SLUG}`, route => {
		if (route.request().method() === "PUT") {
			route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({ message: "Internal Server Error" })
			});
		} else {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(orgData)
			});
		}
	});

	await page.goto(BASE_URL);
	const orgInput = page.locator("#orgName");
	await expect(orgInput).toHaveValue("原始名稱", { timeout: 5000 });

	await orgInput.click({ clickCount: 3 });
	await orgInput.type("新名稱");
	await orgInput.press("Enter");

	await expect(page.locator("text=儲存失敗")).toBeVisible({ timeout: 5000 });
});

test("AS-INT-003: adding a member successfully shows toast, clears input, and updates list", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);

	let getMembersCallCount = 0;
	await page.route(`**/api/unit/orgs/${ORG_SLUG}/members`, route => {
		if (route.request().method() === "POST") {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ id: "m99", name: "New Member", emails: ["new@example.com"] })
			});
		} else {
			getMembersCallCount++;
			const memberList = getMembersCallCount === 1 ? [memberAlice, memberBob] : [memberAlice, memberBob, { id: "m99", name: "New Member", emails: ["new@example.com"], avatarUrl: "" }];
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(memberList)
			});
		}
	});

	await page.goto(BASE_URL);
	await page.waitForSelector("text=Alice");

	const emailInput = page.locator('input[placeholder="member@example.com"]');
	await emailInput.fill("new@example.com");
	await page.click("button:has-text('新增成員')");

	await expect(page.locator("text=邀請成功")).toBeVisible({ timeout: 5000 });

	await expect(emailInput).toHaveValue("");

	await expect(page.locator("text=New Member")).toBeVisible({ timeout: 5000 });
});

test("AS-INT-004: add member failure shows error toast and keeps email in input", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);
	await page.route(`**/api/unit/orgs/${ORG_SLUG}/members`, route => {
		if (route.request().method() === "POST") {
			route.fulfill({
				status: 400,
				contentType: "application/json",
				body: JSON.stringify({ message: "Email 已存在" })
			});
		} else {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([memberAlice])
			});
		}
	});

	await page.goto(BASE_URL);
	const emailInput = page.locator('input[placeholder="member@example.com"]');
	await emailInput.fill("existing@example.com");
	await page.click("button:has-text('新增成員')");

	await expect(page.locator("text=邀請失敗")).toBeVisible({ timeout: 5000 });
	await expect(emailInput).toHaveValue("existing@example.com");
});

test("AS-INT-005: clicking 新增成員 with empty email does not send POST", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}/members`, []);

	let postCalled = false;
	await page.route(`**/api/unit/orgs/${ORG_SLUG}/members`, route => {
		if (route.request().method() === "POST") {
			postCalled = true;
			route.continue();
		} else {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([])
			});
		}
	});

	await page.goto(BASE_URL);
	await page.waitForSelector("button:has-text('新增成員')");
	await page.click("button:has-text('新增成員')");

	await page.waitForTimeout(200);
	expect(postCalled).toBe(false);
});

test("AS-INT-006: remove member dialog confirms, calls DELETE, and updates list", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);

	let getMembersCount = 0;
	await page.route(`**/api/unit/orgs/${ORG_SLUG}/members`, route => {
		getMembersCount++;
		if (getMembersCount === 1) {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([memberAlice, memberBob, memberCarol])
			});
		} else {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([memberAlice, memberCarol])
			});
		}
	});

	let deleteCalled = false;
	await page.route(`**/api/unit/orgs/${ORG_SLUG}/members/${memberBob.id}`, route => {
		if (route.request().method() === "DELETE") {
			deleteCalled = true;
			route.fulfill({ status: 204 });
		} else {
			route.continue();
		}
	});

	await page.goto(BASE_URL);
	await page.waitForSelector("text=Alice");
	await page.waitForSelector("text=Bob");

	const bobRow = page.locator("[class*='memberCard']").filter({ hasText: "Bob" });
	await bobRow.locator("button").click();

	await expect(page.getByRole("dialog")).toBeVisible();
	await expect(page.getByRole("dialog")).toContainText("Bob");

	await page.click("button:has-text('確認移除')");

	expect(deleteCalled).toBe(true);

	await expect(page.locator("text=已移除成員")).toBeVisible({ timeout: 5000 });
	await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });

	await expect(page.locator("text=Bob")).not.toBeVisible({ timeout: 5000 });
	await expect(page.locator("text=Alice")).toBeVisible();
	await expect(page.locator("text=Carol")).toBeVisible();
});

test("AS-INT-007: DELETE failure shows error toast and member list remains unchanged", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}/members`, [memberAlice, memberBob, memberCarol]);

	await page.route(`**/api/unit/orgs/${ORG_SLUG}/members/${memberBob.id}`, route => {
		if (route.request().method() === "DELETE") {
			route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({ message: "Internal Server Error" })
			});
		} else {
			route.continue();
		}
	});

	await page.goto(BASE_URL);
	await page.waitForSelector("text=Bob");

	const bobRow = page.locator("[class*='memberCard']").filter({ hasText: "Bob" });
	await bobRow.locator("button").click();
	await page.click("button:has-text('確認移除')");

	await expect(page.locator("text=移除失敗")).toBeVisible({ timeout: 5000 });
	await expect(page.locator("text=Bob")).toBeVisible();
});

test("AS-INT-008: clicking cancel in remove dialog dismisses it without sending DELETE", async ({ page }) => {
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}`, orgData);
	await mockRoute(page, `**/api/unit/orgs/${ORG_SLUG}/members`, [memberAlice, memberBob]);

	let deleteCalled = false;
	await page.route(`**/api/unit/orgs/${ORG_SLUG}/members/**`, route => {
		if (route.request().method() === "DELETE") {
			deleteCalled = true;
			route.continue();
		} else {
			route.continue();
		}
	});

	await page.goto(BASE_URL);
	await page.waitForSelector("text=Alice");

	const aliceRow = page.locator("[class*='memberCard']").filter({ hasText: "Alice" });
	await aliceRow.locator("button").click();

	await expect(page.getByRole("dialog")).toBeVisible();

	await page.click("button:has-text('取消')");

	await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
	expect(deleteCalled).toBe(false);
	await expect(page.locator("text=Alice")).toBeVisible();
});
