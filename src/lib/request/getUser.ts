import type { User } from "@/types/user.ts";
import { api } from "@/lib/request/api.ts";

export async function getUser(): Promise<User> {
	return api<User>("/users/me");
}
