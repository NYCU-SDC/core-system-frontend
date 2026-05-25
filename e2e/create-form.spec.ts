import { expect, mockOrg, mockRoute, test } from "./fixtures";

test("建立表單並編輯基本資訊", async ({ page }) => {
	const orgSlug = process.env.E2E_ORG_SLUG ?? mockOrg.slug;
	const newFormId = "e2e-form-basic";
	const uniqueSuffix = Date.now();
	const title = `E2E 建立表單 ${uniqueSuffix}`;
	const description = `這是 e2e 測試建立的表單描述 ${uniqueSuffix}`;
	const confirmMessage = `感謝填寫（${uniqueSuffix}）`;
	const startDate = "2026-05-01";
	const endDate = "2026-06-30";

	await mockRoute(page, `**/api/orgs/${orgSlug}/forms**`, [], { method: "GET" });
	await mockRoute(page, `**/api/forms/${newFormId}**`, {
		id: newFormId,
		title: "未命名表單",
		description: "",
		messageAfterSubmission: "",
		status: "DRAFT",
		visibility: "PUBLIC"
	});
	await mockRoute(page, `**/api/forms/${newFormId}/sections**`, []);
	await mockRoute(page, `**/api/forms/${newFormId}/responses**`, { responses: [] });
	await page.route(`**/api/orgs/${orgSlug}/forms**`, async route => {
		if (route.request().method() === "POST") {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ id: newFormId, title: "未命名表單", status: "DRAFT" })
			});
			return;
		}
		await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
	});

	await page.goto(`/orgs/${orgSlug}/forms`);

	await expect(page.getByRole("button", { name: "建立表單" })).toBeVisible({ timeout: 15000 });
	await page.getByRole("button", { name: "建立表單" }).click();

	await expect(page).toHaveURL(new RegExp(`/orgs/${orgSlug}/forms/${newFormId}/info$`));

	const titleInput = page.getByPlaceholder("輸入表單標題");
	const descriptionInput = page.getByText("表單描述").locator("..").locator("[contenteditable='true']");
	const confirmMessageInput = page.getByPlaceholder("輸入表單提交後顯示的訊息");
	const startDateInput = page.locator('div:has(> label:has-text("開始日期")) input[type="date"]');
	const endDateInput = page.locator('div:has(> label:has-text("結束日期")) input[type="date"]');

	await titleInput.fill(title);
	await descriptionInput.click();
	await descriptionInput.fill(description);
	await confirmMessageInput.fill(confirmMessage);
	await startDateInput.fill(startDate);
	await endDateInput.fill(endDate);

	const saveStatus = page.locator('div[aria-live="polite"] span');
	await expect(saveStatus).toBeVisible();

	await expect(titleInput).toHaveValue(title);
	await expect(descriptionInput).toContainText(description);
	await expect(confirmMessageInput).toHaveValue(confirmMessage);
	await expect(startDateInput).toHaveValue(startDate);
	await expect(endDateInput).toHaveValue(endDate);
});

test("編輯表單測試", async ({ page }) => {
	const orgSlug = process.env.E2E_ORG_SLUG ?? mockOrg.slug;
	const newFormId = "e2e-form-1";
	const workflowNodes = [
		{ id: "start-1", type: "START", label: "開始", payload: { x: 0, y: 0 }, next: "end-1" },
		{ id: "end-1", type: "END", label: "結束", payload: { x: 0, y: 200 } }
	];
	let workflowNodeIndex = 1;

	await mockRoute(page, `**/api/orgs/${orgSlug}/forms**`, [], { method: "GET" });
	await mockRoute(page, `**/api/forms/${newFormId}**`, {
		id: newFormId,
		title: "未命名表單",
		description: "",
		messageAfterSubmission: "",
		status: "DRAFT",
		visibility: "PUBLIC"
	});
	await mockRoute(page, `**/api/forms/${newFormId}/sections**`, []);
	await mockRoute(page, `**/api/forms/${newFormId}/responses**`, { responses: [] });
	await page.route(`**/api/forms/${newFormId}/workflow`, async route => {
		if (route.request().method() === "GET") {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ workflow: workflowNodes })
			});
			return;
		}
		if (route.request().method() === "PUT") {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(workflowNodes)
			});
			return;
		}
		await route.continue();
	});
	await page.route(`**/api/forms/${newFormId}/workflow/nodes`, async route => {
		if (route.request().method() === "POST") {
			const body = route.request().postDataJSON() as { type?: string } | null;
			const nodeType = body?.type ?? "SECTION";
			const nodeId = `${nodeType.toLowerCase()}-${workflowNodeIndex++}`;
			const created = {
				id: nodeId,
				type: nodeType,
				label: nodeType === "CONDITION" ? "條件" : "未命名區段",
				payload: { x: 120, y: 120 }
			};
			workflowNodes.push(created);
			await route.fulfill({
				status: 201,
				contentType: "application/json",
				body: JSON.stringify(created)
			});
			return;
		}
		await route.continue();
	});
	await page.route(`**/api/forms/${newFormId}/sections/**`, async route => {
		const method = route.request().method();
		if (method === "PUT") {
			const body = route.request().postDataJSON() as { title?: string; description?: unknown } | null;
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ id: "section-1", title: body?.title ?? "test section", description: body?.description ?? null })
			});
			return;
		}
		await route.continue();
	});
	await page.route("**/api/sections/**/questions**", async route => {
		const method = route.request().method();
		if (method === "POST") {
			const body = route.request().postDataJSON() as { title?: string; type?: string; description?: unknown; required?: boolean } | null;
			await route.fulfill({
				status: 201,
				contentType: "application/json",
				body: JSON.stringify({
					id: `q-${Date.now()}`,
					sectionId: "section-1",
					title: body?.title ?? "問題標題",
					type: body?.type ?? "SHORT_TEXT",
					description: body?.description ?? null,
					required: body?.required ?? false
				})
			});
			return;
		}
		if (method === "PUT") {
			await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
			return;
		}
		await route.continue();
	});
	await page.route(`**/api/orgs/${orgSlug}/forms**`, async route => {
		if (route.request().method() === "POST") {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ id: newFormId, title: "未命名表單", status: "DRAFT" })
			});
			return;
		}
		await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
	});

	await page.goto(`/orgs/${orgSlug}/forms`);
	await expect(page.getByRole("button", { name: "建立表單" })).toBeVisible({ timeout: 15000 });
	await page.getByRole("button", { name: "建立表單" }).click();

	await expect(page).toHaveURL(new RegExp(`/orgs/${orgSlug}/forms/${newFormId}/info$`));
	const formId = newFormId;

	await page.goto(`/orgs/${orgSlug}/forms/${formId}/edit`);
	await expect(page.getByRole("button", { name: "新增區域" })).toBeVisible({ timeout: 15000 });

	const nodes = page.locator(".react-flow__node");
	const initialNodeCount = await nodes.count();
	await page.getByRole("button", { name: "新增區域" }).click();
	await expect(nodes).toHaveCount(initialNodeCount + 1);
	await nodes.nth(initialNodeCount).dblclick();

	await page.waitForURL(new RegExp(`/orgs/${orgSlug}/forms/${formId}/section/[^/]+/edit$`));

	const sectionTitleInput = page.getByPlaceholder("區段標題");
	await expect(sectionTitleInput).toBeVisible();
	await sectionTitleInput.fill("test section");
	await sectionTitleInput.blur();

	const questionTypes = ["文字簡答", "長文字簡答", "單選選擇題", "核取方塊", "下拉選單", "詳細核取方塊", "日期選擇", "檔案上傳", "線性刻度", "排序", "超連結", "評分", "OAuth 驗證"];

	for (const label of questionTypes) {
		const button = page.getByRole("button", { name: label, exact: true });
		await button.scrollIntoViewIfNeeded();
		await button.click();
	}

	await page.getByRole("button", { name: "返回" }).click();
	await page.waitForURL(new RegExp(`/orgs/${orgSlug}/forms/${formId}/edit$`));

	const backNodes = page.locator(".react-flow__node");
	await expect(backNodes).toHaveCount(3);
	const nodeCountBeforeCondition = await backNodes.count();
	await page.getByRole("button", { name: "新增條件" }).click();
	await expect(backNodes).toHaveCount(nodeCountBeforeCondition + 1);
});
