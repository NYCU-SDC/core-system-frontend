import { toast } from "sonner";

const Home = () => {
	// Example usage of Sonner toast
	toast("Welcome to the Home page!", {
		description: "This is a simple toast notification.",
		duration: 5000,
		position: "top-right"
	});
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
			<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<p className="text-gray-600 mb-4">Hello world! This is your main content area.</p>
				<button 
					onClick={() => toast("Hello!")}
					className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
				>
					Click here
				</button>
			</div>
		</div>
	);
};

export default Home;
