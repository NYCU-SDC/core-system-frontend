export const orgKeys = {
	all: ["org"] as const,
	bySlug: (slug: string) => [...orgKeys.all, slug] as const,
	members: (slug: string) => [...orgKeys.bySlug(slug), "members"] as const,
	forms: (slug: string) => [...orgKeys.bySlug(slug), "forms"] as const,
	form: (formId: string) => ["form", formId] as const
};
