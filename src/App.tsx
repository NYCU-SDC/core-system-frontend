import { ToastProvider } from "@radix-ui/react-toast";
import { AppRouter } from "./routes/AppRouter";

const App = () => {
	return (
		<ToastProvider>
			<AppRouter />
		</ToastProvider>
	);
};

export default App;
