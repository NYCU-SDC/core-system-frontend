import { Outlet } from "react-router-dom";

const SimpleLayout = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<main className="w-full">
				<Outlet />
			</main>
		</div>
	);
};

export default SimpleLayout;
