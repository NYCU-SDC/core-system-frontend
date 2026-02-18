import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/styles/dracula.css";
import "./index.css";
import { Providers } from "./providers";

createRoot(document.getElementById("root")!).render(
	<Providers>
		<App />
	</Providers>
);
