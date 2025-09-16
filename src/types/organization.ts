export type OrganizationResponse = {
	id: string;
	name: string;
	description: string;
	metadata: Record<string, string>;
	createdAt: string;
	updatedAt: string;
	slug: string;
};

export type Organization = {
	slug: string;
	name: string;
	initial: string;
};

export type Member = {
	id: string;
	name: string;
	avatarUrl: string;
};
