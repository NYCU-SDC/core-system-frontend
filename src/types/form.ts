export interface FormData {
	id: string;
	title: string;
	unit: string[];
	description: string;
	time: string;
	status: 'draft' | 'published';
}

export interface FormCardProps {
	form: FormData;
	onEdit?: (id: string) => void;
	onPublish?: (id: string) => void;
	onViewResult?: (id: string) => void;
}