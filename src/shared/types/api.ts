export interface ApiResponse<T = unknown> {
	data: T;
	message?: string;
	success: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
}

export interface ApiError {
	message: string;
	code?: string;
	status?: number;
}
