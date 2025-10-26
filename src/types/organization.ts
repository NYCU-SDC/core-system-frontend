export type OrganizationResponse = {
	id: string;
	name: string;
	description: string;
	metadata: Record<string, string>;
	createdAt: string;
	updatedAt: string;
	slug: string;
};

export type OrganizationRequest = {
	name: string;
	description?: string;
	metadata?: Record<string, string>;
	slug: string;
};

export type Organization = {
	slug: string;
	name: string;
	initial: string | React.ReactNode;
};

export type MemberRequest = {
	email: string;
};

export type Member = {
	id: string;
	name: string;
	avatarUrl: string;
};
