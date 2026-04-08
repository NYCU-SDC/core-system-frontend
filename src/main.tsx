import { AppShell } from "@/AppShell";
import { Providers } from "@/providers";
import { AppRouter } from "@/routes/AppRouter";
import { createRoot } from "react-dom/client";
import "./assets/styles/dracula.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<Providers>
		<AppShell>
			<AppRouter />
		</AppShell>
	</Providers>
);
