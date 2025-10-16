// Mock 資料：失敗時用它回傳
import type { InboxItem, InboxResponse } from "./index";

export const MOCK_INBOX_ITEMS: InboxItem[] = Array.from({ length: 5 }).map((_, i) => ({
	id: `mock-${i}`,
	message: {
		id: `mock-msg-${i}`,
		postedBy: `${i}`,
		title: "HITCON 工人聯絡組",
		subtitle: "HITCON CMT 2024 工人行前通知",
		type: "mock",
		contentId: "mock-content",
		createdAt: new Date(Date.now() - i * 60_000).toISOString(), // 每筆差 1 分鐘
		updatedAt: new Date(Date.now() - i * 60_000).toISOString()
	},
	type: {
		isRead: i === 0 || i === 2 ? true : false, // 第 0 筆 & 第 2 筆是已讀
		isStarred: false,
		isArchived: false
	}
}));

export const MOCK_INBOX_RESPONSE: InboxResponse = {
	items: MOCK_INBOX_ITEMS,
	totalPages: 1,
	totalItems: MOCK_INBOX_ITEMS.length,
	currentPage: 1,
	pageSize: MOCK_INBOX_ITEMS.length,
	hasNextPage: false
};

export function getMockInbox(): Promise<InboxResponse> {
	return Promise.resolve(MOCK_INBOX_RESPONSE);
}

export function getMockInboxItemById(id: string): Promise<InboxItem> {
	const found = MOCK_INBOX_ITEMS.find(x => x.id === id || x.message.id === id);
	if (!found) {
		// 隨便回第一筆，避免頁面爆掉；你也可以改成 throw error
		return Promise.resolve(MOCK_INBOX_ITEMS[0]);
	}
	return Promise.resolve(found);
}
