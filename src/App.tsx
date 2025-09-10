import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import Forms from "./pages/Forms";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
// import {Counter} from "@/features/example/Counter.tsx";
import { AppLayout, SimpleLayout } from "./components/layout";

const AppContent = () => {
	return (
		<Routes>
			<Route
				path="/"
				element={<Home />}
			/>
			<Route
				path="/inbox"
				element={<Inbox />}
			/>
			<Route
				path="/forms"
				element={<Forms />}
			/>
			<Route
				path="/settings"
				element={<Settings />}
			/>
			<Route
				path="/profile"
				element={<Profile />}
			/>
		</Routes>
	);
};

const App = () => {
	const location = useLocation();

	// Routes that should use simple layout (no aside navigation)
	const simpleLayoutRoutes = ["/"];
	const useSimpleLayout = simpleLayoutRoutes.includes(location.pathname);

	if (useSimpleLayout) {
		return (
			<SimpleLayout>
				<AppContent />
			</SimpleLayout>
		);
	}

	return (
		<AppLayout>
			<AppContent />
		</AppLayout>
	);
};

export default App;
