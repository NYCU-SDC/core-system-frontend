import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import FormList from "./pages/form/List.tsx";
import FormEdit from './pages/form/Edit.tsx';
import FormResults from "./pages/form/Result.tsx";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
// import {Counter} from "@/features/example/Counter.tsx";
import { AppLayout, SimpleLayout } from "./components/layout";
import { Toaster } from "@/components/ui/sonner";
import { LoginPromptDialog } from "@/components/ui/login-prompt-dialog";
import { useGlobalAuthError } from "@/hooks/useAuthError";

const AppContent = () => {
	return (
		<Routes>
			<Route element={<SimpleLayout />}>
				<Route
					path="/"
					element={<Home />}
				/>
			</Route>
			<Route element={<AppLayout />}>
				<Route
					path="/inbox"
					element={<Inbox />}
				/>
				<Route
					path="/:slug/inbox"
					element={<Inbox />}
				/>
				<Route
					path="/:slug/forms"
					element={<FormList />}
				/>
				<Route
					path="/:slug/forms/edit/:id"
					element={<FormEdit />}
				/>
				<Route
					path="/:slug/forms/results/:id"
					element={<FormResults />}
				/>
				<Route
					path="/:slug/settings"
					element={<Settings />}
				/>
				<Route
					path="/profile"
					element={<Profile />}
				/>
			</Route>
		</Routes>
	);
};

const App = () => {
	const { showLoginPrompt, handleLogin, closeLoginPrompt } = useGlobalAuthError();

	return (
		<>
			<AppContent />
			<Toaster />
			<LoginPromptDialog
				open={showLoginPrompt}
				onOpenChange={closeLoginPrompt}
				onLogin={handleLogin}
			/>
		</>
	);
};

export default App;
