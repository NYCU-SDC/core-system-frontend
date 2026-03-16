import { test as base, type Page } from "@playwright/test";

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

interface Fixtures {
	withAuth: void;
}

export const test = base.extend<Fixtures>({
	withAuth: [
		async ({ page }, use) => {
			await page.context().addCookies([
				{
					name: "access_token",
					value: "mock-access-token",
					domain: "localhost",
					path: "/",
					httpOnly: true,
					sameSite: "Lax"
				}
			]);

			await page.route("**/api/users/me", route =>
				route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(mockUser)
				})
			);
			await page.route("**/api/orgs/me", route =>
				route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([mockOrg])
				})
			);
			await page.route("**/api/auth/refresh", route => route.fulfill({ status: 204 }));

			await use();
		},
		{ auto: true }
	]
});

export { expect } from "@playwright/test";

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
