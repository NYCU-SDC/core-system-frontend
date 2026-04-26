export const userKeys = {
	all: ["user"] as const,
	me: ["user", "me"] as const
};

export const orgKeys = {
	all: ["org"] as const,
	bySlug: (slug: string) => [...orgKeys.all, slug] as const,
	members: (slug: string) => [...orgKeys.bySlug(slug), "members"] as const,
	forms: (slug: string, statuses?: string[]) =>
		statuses && statuses.length > 0 ? ([...orgKeys.bySlug(slug), "forms", ...[...statuses].sort()] as const) : ([...orgKeys.bySlug(slug), "forms"] as const),
	form: (formId: string) => ["form", formId] as const,
	myOrgs: ["orgs", "me"] as const
};

export const slugKeys = {
	status: (slug: string) => ["slug", slug, "status"] as const,
	history: (slug: string) => ["slug", slug, "history"] as const
};

export const formKeys = {
	sections: (formId: string) => ["form", formId, "sections"] as const,
	workflow: (formId: string) => ["form", formId, "workflow"] as const,
	responses: (formId: string) => ["form", formId, "responses"] as const,
	response: (formId: string, responseId: string) => ["form", formId, "responses", responseId] as const,
	fonts: ["form", "fonts"] as const,
	googleSheetEmail: ["forms", "google-sheet-email"] as const,
	myForms: ["forms", "me"] as const,
	questionResponse: (responseId: string, questionId: string) => ["response", responseId, "question", questionId] as const
};
