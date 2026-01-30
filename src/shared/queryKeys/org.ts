export const orgKeys = {
	all: ["org"] as const,
	bySlug: (slug: string) => [...orgKeys.all, slug] as const,
	members: (slug: string) => [...orgKeys.bySlug(slug), "members"] as const
};
