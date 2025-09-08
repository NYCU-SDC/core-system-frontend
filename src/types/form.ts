export interface Form {
	id: string;
	title: string;
	description: string;
	status: 'draft' | 'published';
	unitId: string;
	lastEditor: string;
	createdAt: string;
	updatedAt: string;
}

