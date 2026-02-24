import { Providers } from "@/providers";
import { createRoot } from "react-dom/client";
import "../assets/styles/dracula.css";
import "../index.css";
import UserApp from "./UserApp";

createRoot(document.getElementById("root")!).render(
	<Providers>
		<UserApp />
	</Providers>
);
