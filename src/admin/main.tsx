import { Providers } from "@/providers";
import { createRoot } from "react-dom/client";
import "../assets/styles/dracula.css";
import "../index.css";
import AdminApp from "./AdminApp";

createRoot(document.getElementById("root")!).render(
	<Providers>
		<AdminApp />
	</Providers>
);
