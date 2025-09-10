import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import FormList from "./pages/form/List.tsx";
import FormEdit from './pages/form/Edit.tsx';
import FormResults from "./pages/form/Result.tsx";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
// import {Counter} from "@/features/example/Counter.tsx";
import { AppLayout, SimpleLayout } from "./components/layout";

const AppContent = () => {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/inbox" element={<Inbox />} />
			<Route path="/forms" element={<FormList />} />
			<Route path="/forms/new" element={<FormEdit />} />
			<Route path="/forms/edit/:id" element={<FormEdit />} />
			<Route path="/forms/results/:id" element={<FormResults />} />
			<Route path="/settings" element={<Settings />} />
			<Route path="/profile" element={<Profile />} />
		</Routes>
	);
};

const App = () => {
	const location = useLocation();

	// Routes that should use simple layout (no aside navigation)
	const simpleLayoutRoutes = ["/auth/callback"];
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
