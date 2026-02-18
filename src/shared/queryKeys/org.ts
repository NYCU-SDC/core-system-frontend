export const orgKeys = {
	all: ["org"] as const,
	bySlug: (slug: string) => [...orgKeys.all, slug] as const,
	members: (slug: string) => [...orgKeys.bySlug(slug), "members"] as const,
	forms: (slug: string) => [...orgKeys.bySlug(slug), "forms"] as const,
	form: (formId: string) => ["form", formId] as const
};

export const formKeys = {
	sections: (formId: string) => ["form", formId, "sections"] as const,
	workflow: (formId: string) => ["form", formId, "workflow"] as const,
	responses: (formId: string) => ["form", formId, "responses"] as const,
	response: (formId: string, responseId: string) => ["form", formId, "responses", responseId] as const,
	fonts: ["form", "fonts"] as const
};
