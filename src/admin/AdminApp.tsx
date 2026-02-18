import { AppShell } from "../AppShell";
import { AdminRouter } from "../routes/AdminRouter";

export default function AdminApp() {
	return (
		<AppShell>
			<AdminRouter />
		</AppShell>
	);
}
