import { Textarea } from "@/components/ui/textarea.tsx";

export default function LongTextQuestion() {
	return (
		<div className="long-input-container w-[350px] flex flex-col gap-1.5">
			<p className="input-title text-sm font-medium text-slate-900 border-slate-300">長輸入</p>
			<Textarea />
		</div>
	);
}
