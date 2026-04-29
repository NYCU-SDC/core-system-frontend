import { expect, test as setup } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const ADMIN_USER_ID = process.env.E2E_ADMIN_USER_ID ?? "4eb1b1e2-7bd5-4b08-b3b5-2d3e0459516e";
const authFile = path.resolve(process.cwd(), "playwright/.auth/admin.json");

setup("authenticate seeded admin", async ({ request }) => {
	const loginResponse = await request.post("/api/auth/login/internal", {
		data: {
			uid: ADMIN_USER_ID
		}
	});

	expect(loginResponse.ok(), `internal login failed: ${loginResponse.status()} ${await loginResponse.text()}`).toBeTruthy();

	const meResponse = await request.get("/api/users/me");
	expect(meResponse.ok(), `user/me check failed: ${meResponse.status()} ${await meResponse.text()}`).toBeTruthy();

	await fs.mkdir(path.dirname(authFile), { recursive: true });
	await request.storageState({ path: authFile });
});
