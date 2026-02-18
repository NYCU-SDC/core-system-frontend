import { AppShell } from "../AppShell";
import { UserRouter } from "../routes/UserRouter";

export default function UserApp() {
	return (
		<AppShell>
			<UserRouter />
		</AppShell>
	);
}
