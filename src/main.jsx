
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import OrangeAgendaForm from "./OrangeAgendaForm";
import "@nycu-sdc/orange-agenda/styles";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<OrangeAgendaForm />
	</StrictMode>
);
