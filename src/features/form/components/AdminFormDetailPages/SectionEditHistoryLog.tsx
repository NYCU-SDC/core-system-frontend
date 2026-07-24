import type { SectionEditSnapshot } from "@/features/form/hooks/useSectionEditUndo";
import { History } from "lucide-react";
import { useMemo } from "react";
import styles from "./SectionEditHistoryLog.module.css";
import type { Question } from "./types/question";

// Read-only view of the editor undo stack; labels are derived by diffing adjacent snapshots
// (question number + which field), so no state is mutated.

type HistoryView = {
	past: SectionEditSnapshot[];
	present: SectionEditSnapshot;
	future: SectionEditSnapshot[];
};

type SectionEditHistoryLogProps = {
	history: HistoryView;
};

type Position = "past" | "current" | "future";

type Row = { key: string; label: string; position: Position };

// Which field of a question changed between two versions. Order = priority when several differ.
const changedFieldLabel = (a: Question | undefined, b: Question | undefined): string => {
	if (!a || !b) return "編輯";
	if (a.title !== b.title) return "標題";
	if (JSON.stringify(a.description) !== JSON.stringify(b.description)) return "描述";
	if (a.type !== b.type) return "題型";
	if (Boolean(a.required) !== Boolean(b.required)) return "必填";
	if (JSON.stringify(a.options) !== JSON.stringify(b.options)) return "選項";
	if (JSON.stringify(a.detailOptions) !== JSON.stringify(b.detailOptions)) return "詳細選項";
	if (a.start !== b.start || a.end !== b.end || a.startLabel !== b.startLabel || a.endLabel !== b.endLabel || a.icon !== b.icon) return "刻度";
	if (a.dateHasYear !== b.dateHasYear || a.dateHasMonth !== b.dateHasMonth || a.dateHasDay !== b.dateHasDay || a.dateMinDate !== b.dateMinDate || a.dateMaxDate !== b.dateMaxDate) return "日期設定";
	if (a.uploadAllowedFileTypes?.join(",") !== b.uploadAllowedFileTypes?.join(",") || a.uploadMaxFileAmount !== b.uploadMaxFileAmount || a.uploadMaxFileSizeLimit !== b.uploadMaxFileSizeLimit) return "上傳設定";
	if (a.url !== b.url) return "連結";
	if (a.oauthProvider !== b.oauthProvider) return "綁定平台";
	if (Boolean(a.isFromAnswer) !== Boolean(b.isFromAnswer) || a.sourceQuestionId !== b.sourceQuestionId) return "選項來源";
	return "編輯";
};

const clientIdSeq = (snap: SectionEditSnapshot) => snap.questions.map(question => question.clientId ?? "");

const labelStep = (prev: SectionEditSnapshot, curr: SectionEditSnapshot): string => {
	const prevSeq = clientIdSeq(prev);
	const currSeq = clientIdSeq(curr);

	// Different length → a structural change slipped into history (shouldn't normally happen since those
	// reset history, but label it safely rather than mislabelling a field edit).
	if (prevSeq.length !== currSeq.length) return currSeq.length > prevSeq.length ? "新增題目" : "刪除題目";
	// Same questions, different order → reorder.
	if (JSON.stringify(prevSeq) !== JSON.stringify(currSeq)) {
		if ([...prevSeq].sort().join("|") === [...currSeq].sort().join("|")) return "調整題目順序";
		return "編輯";
	}
	// Same order → a single question's field changed.
	for (let i = 0; i < currSeq.length; i++) {
		if (JSON.stringify(prev.questions[i]) !== JSON.stringify(curr.questions[i])) {
			return `Q${i + 1} · ${changedFieldLabel(prev.questions[i], curr.questions[i])}編輯`;
		}
	}
	return "編輯";
};

export const SectionEditHistoryLog = ({ history }: SectionEditHistoryLogProps) => {
	const rows = useMemo<Row[]>(() => {
		const stack = [...history.past, history.present, ...history.future];
		const currentIndex = history.past.length;
		return stack.map((snap, i) => {
			const label = i === 0 ? "此區段起點" : labelStep(stack[i - 1], snap);
			const position: Position = i === currentIndex ? "current" : i < currentIndex ? "past" : "future";
			return { key: String(i), label, position };
		});
	}, [history]);

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<History size={14} />
				<span>步驟紀錄</span>
			</div>
			{rows.length <= 1 ? (
				<p className={styles.empty}>目前沒有可還原的編輯。新增／複製／刪除題目會重置此紀錄。</p>
			) : (
				<ul className={styles.list}>
					{rows.map(row => (
						<li key={row.key} className={`${styles.row} ${row.position === "current" ? styles.rowCurrent : ""} ${row.position === "future" ? styles.rowFuture : ""}`}>
							<span className={styles.dotCol}>
								<span className={`${styles.dot} ${row.position === "current" ? styles.dotCurrent : ""} ${row.position === "future" ? styles.dotFuture : ""}`} />
							</span>
							<span className={styles.label}>{row.label}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

SectionEditHistoryLog.displayName = "SectionEditHistoryLog";
