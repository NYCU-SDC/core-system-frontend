import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/user.ts";
import { getUser } from "@/lib/request/getUser.ts";

export function useGetUser() {
	return useQuery<User>({
		queryKey: ["user", "me"],
		queryFn: () => getUser()
	});
}
