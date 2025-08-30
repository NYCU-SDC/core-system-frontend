import { toast } from "sonner";

const Home = () => {
	// Example usage of Sonner toast
	toast("Welcome to the Home page!", {
		description: "This is a simple toast notification.",
		duration: 5000,
		position: "top-right"
	});
	return (
		<>
			<div>Hello world</div>
			<button onClick={() => toast("Hello!")}>Click here</button>
		</>
	);
};

export default Home;
