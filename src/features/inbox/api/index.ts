const BASE_URL = "https://dev.core-system.sdc.nycu.club";

export interface InboxMessage {
	id: string;
	postedBy: string;
	title: string;
	subtitle: string;
	type: string;
	contentId: string;
	createdAt: string;
	updatedAt: string;
}

export interface InboxItemFlags {
	isRead: boolean;
	isStarred: boolean;
	isArchived: boolean;
}

export interface InboxItem {
	id: string;
	message: InboxMessage;
	type: InboxItemFlags;
}

export interface InboxResponse {
	items: InboxItem[];
	totalPages: number;
	totalItems: number;
	currentPage: number;
	pageSize: number;
	hasNextPage: boolean;
}

import { getMockInbox, getMockInboxItemById } from "./mock";

// // GET Inbox
// export async function fetchInbox(): Promise<InboxResponse> {
//   const res = await fetch(`${BASE_URL}/api/inbox`, {
//     method: "GET",
//     headers: {
//       "Accept": "application/json",
//     },
//   });
//
//   if (!res.ok) {
//     throw new Error(`GET /api/inbox failed: ${res.status} ${res.statusText}`);
//   }
//
//   return res.json();
// }

// GET Inbox w/ mock
export async function fetchInbox(): Promise<InboxResponse> {
	try {
		const res = await fetch(`${BASE_URL}/api/inbox`, {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});

		if (!res.ok) {
			console.warn(`GET /api/inbox failed: ${res.status} ${res.statusText}. Use mock.`);
			return await getMockInbox();
		}

		return (await res.json()) as InboxResponse;
	} catch (err) {
		console.warn("GET /api/inbox network error. Use mock.", err);
		return await getMockInbox();
	}
}

// GET inbox item (one by one)
export async function fetchInboxById(id: string): Promise<InboxItem> {
	const res = await fetch(`${BASE_URL}/api/inbox/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch inbox item with id ${id}`);
	}

	const data: InboxItem = await res.json();
	return data;
}

// POST form response
export interface FormAnswerRequest {
	answers: {
		questionId: string;
		value: string;
	}[];
}

export async function submitFormResponse(formId: string, answers: FormAnswerRequest): Promise<void> {
	const res = await fetch(`${BASE_URL}/api/forms/${formId}/responses`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(answers)
	});

	if (!res.ok) {
		throw new Error(`Failed to submit form response: ${res.status} ${res.statusText}`);
	}
}
