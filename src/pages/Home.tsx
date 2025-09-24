import { Button } from "@/components/ui";

const Home = () => {
	const login = () => {
		console.log(import.meta.env.VITE_API_BASE_URL);
		console.log(window.location.origin);
		window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/login/oauth/google?r=${window.location.origin}/inbox`;
	};

	return (
		<div className="h-screen text-center flex flex-col items-center justify-center font-[Quantico]">
			<p className="text-5xl text-slate-700 tracking-widest font-bold">Core System</p>
			<p className="mt-[22px] text-sm text-slate-300 tracking-[6px]">/* Everything all at once */</p>
			<Button
				className="mt-[41px] font-bold"
				variant="outline"
				onClick={login}
			>
				Login with Google
			</Button>
		</div>
	);
};

export default Home;
