// inbox.ts

export interface Inbox {
    items: {
        id: string;
        message: {
            id: string;
            postedBy: string;
            title: string;
            subtitle: string;
            type: "text" | "form" | string; // 依照實際可能的值擴充
            contentId: string;
            createdAt: string; // ISO timestamp
            updatedAt: string; // ISO timestamp
        };
        type: {
            isRead: boolean;
            isStarred: boolean;
            isArchived: boolean;
        };
    }[];
    totalPages: number;
    totalItems: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
};

export interface Message {
    id: string;
    postedBy: string;
    title: string;
    subtitle: string;
    type: "text" | "image" | "video" | string; // 可依實際需求擴充
    contentId: string;
    createdAt: string; // ISO 時間字串
    updatedAt: string; // ISO 時間字串
}

export interface Content {
    id: string;
    title: string;
    description: string;
    status: "draft" | "published" | "archived" | string; // 可依實際需求擴充
    unitId: string;
    lastEditor: string;
    createdAt: string;
    updatedAt: string;
}

export interface ItemType {
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
}

export interface InboxItem {
    id: string;
    message: Message;
    content: Content;
    type: ItemType;
}
export interface InboxItemType {
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
}


