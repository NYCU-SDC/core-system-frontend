import { Input } from "@/components/ui/input.tsx";

export default function ShortTextQuestion() {
	return (
		<div className="short-input-container w-[350px] flex flex-col gap-1.5">
			<p className="input-title text-sm font-medium text-slate-900">短輸入</p>
			<Input
				type="text"
				placeholder="Pietro Schirano"
			></Input>
		</div>
	);
}
