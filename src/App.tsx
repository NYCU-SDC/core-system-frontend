import { Route, Routes } from "react-router-dom";
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
					element={<Forms />}
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
	return <AppContent />;
};

export default App;
