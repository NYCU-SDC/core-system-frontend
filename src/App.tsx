import { AppShell } from "./AppShell";
import { AppRouter } from "./routes/AppRouter";

const App = () => {
	return (
		<AppShell>
			<AppRouter />
		</AppShell>
	);
};

export default App;
