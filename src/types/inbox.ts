// inbox.ts

// 基礎共用 interfaces
export interface Message {
	id: string;
	postedBy: string;
	title: string;
	org: string;
	unit: string;
	type: "text" | "form" | string; // 可依實際需求擴充
	previewMessage: string;
	contentId: string;
	createdAt: string; // ISO timestamp
	updatedAt: string; // ISO timestamp
}

export interface Content {
	id: string;
	title: string;
	description: string;
	previewMessage: string;
	status: "draft" | "published" | string; // 可依實際需求擴充
	unitId: string;
	lastEditor: string;
	deadline: string; // ISO timestamp
	createdAt: string; // ISO timestamp
	updatedAt: string; // ISO timestamp
}

export interface ItemType {
	isRead: boolean;
	isStarred: boolean;
	isArchived: boolean;
}

// 分頁資訊的共用 interface
export interface PaginationInfo {
	totalPages: number;
	totalItems: number;
	currentPage: number;
	pageSize: number;
	hasNextPage: boolean;
}

// 單一項目的完整資料（包含 content）
export interface InboxItemResponse {
	id: string;
	message: Message;
	content: Content;
	isRead: boolean;
	isStarred: boolean;
	isArchived: boolean;
}
export interface InboxItem {
	id: string;
	message: Message;
	isRead: boolean;
	isStarred: boolean;
	isArchived: boolean;
}

// 列表中的項目（不包含 content）
export interface InboxListResponse {
	items: InboxItem[];
	totalPages: number;
	totalItems: number;
	currentPage: number;
	pageSize: number;
	hasNextPage: boolean;
}

// 單一項目的 API 回應
// export interface InboxItemResponse extends InboxItemWithContent {}
//
// // 列表的 API 回應
// export interface InboxListResponse extends PaginationInfo {
//     items: InboxListItem[];
// }
//
// // 為了向後相容，保留原本的命名
// export type InboxItem = InboxListItem;
// export type InboxResponse = InboxListResponse;

export interface Choice {
	id: string;
	name: string;
}

// 根據 API 文檔定義的表單字段類型
export type FormFieldType = "short_text" | "long_text" | "single_choice" | "multiple_choice" | "date";

type FieldBase = {
	id: string;
	formId: string;
	title: string;
	order: number;
	required: boolean;
	description: string;
	createdAt: string;
	updatedAt: string;
};
export type ShortTextField = FieldBase & {
	type: "short_text";
	choices?: never;
};
export type LongTextField = FieldBase & {
	type: "long_text";
	choices?: never;
};
export type DateField = FieldBase & {
	type: "date";
	choices?: never;
};

export type SingleChoiceField = FieldBase & {
	type: "single_choice";
	choices: Choice[];
};

export type MultipleChoiceField = FieldBase & {
	type: "multiple_choice";
	choices: Choice[];
};
export type InboxItemContentResponse = ShortTextField | SingleChoiceField | MultipleChoiceField | LongTextField | DateField;
// export interface InboxItemContentResponse {
//     id: string;
//     formId: string;
//     required: boolean;
//     type: FormFieldType;
//     title: string;
//     description: string;
//     order: number; // int32 整數
//     choices: Choice[]; // 用於 single_choice 和 multiple_choice 問題的可選項目
//     createdAt: string; // date-time 格式
//     updatedAt: string; // date-time 格式
// }
