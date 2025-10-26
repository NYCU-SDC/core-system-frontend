import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
			<div className="text-center">
				<h1 className="text-9xl font-bold text-slate-300">404</h1>
				<h2 className="text-3xl font-semibold text-slate-900 mt-4 mb-2">Page Not Found</h2>
				<p className="text-slate-600 mb-8 max-w-md mx-auto">Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.</p>
				<div className="flex gap-4 justify-center">
					<Button
						variant="outline"
						onClick={() => navigate(-1)}
						className="gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Go Back
					</Button>
					<Button
						onClick={() => navigate("/inbox")}
						className="gap-2"
					>
						<Home className="w-4 h-4" />
						Go Home
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
