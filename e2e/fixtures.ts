import { test as base, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
export const mockUser = {
	id: "user-1",
	name: "小明",
	username: "xiaoming",
	emails: ["xiaoming@example.com"]
};

export const mockOrg = {
	id: "org-1",
	name: "NYCU SDC",
	slug: "SDC",
	description: "軟體研發社",
	metadata: {}
};

// ---------------------------------------------------------------------------
// Fixture extensions
// ---------------------------------------------------------------------------
interface Fixtures {
	/** Stubs the two auth-related endpoints so route guards pass. */
	withAuth: void;
}

export const test = base.extend<Fixtures>({
	withAuth: [
		async ({ page }, use) => {
			await page.route("**/api/unit/users/me", route =>
				route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(mockUser)
				})
			);
			await page.route("**/api/unit/orgs", route =>
				route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([mockOrg])
				})
			);
			await use();
		},
		{ auto: true } // applied to every test automatically
	]
});

export { expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Stubs a single API route with a JSON response.
 * Supports method filtering via the `method` option.
 */
export async function mockRoute(page: Page, pattern: string, body: unknown, options: { status?: number; method?: string } = {}) {
	const { status = 200, method } = options;
	await page.route(pattern, route => {
		if (method && route.request().method() !== method.toUpperCase()) {
			return route.continue();
		}
		route.fulfill({
			status,
			contentType: "application/json",
			body: JSON.stringify(body)
		});
	});
}
