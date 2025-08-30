import { type ReactNode } from "react";

interface SimpleLayoutProps {
	children: ReactNode;
}

const SimpleLayout = ({ children }: SimpleLayoutProps) => {
	return (
		<div className="min-h-screen bg-gray-50">
			<main className="w-full">{children}</main>
		</div>
	);
};

export default SimpleLayout;
