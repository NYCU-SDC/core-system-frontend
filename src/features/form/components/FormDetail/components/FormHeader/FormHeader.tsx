import { Button, Markdown, SpinningIcon } from "@/shared/components";
import { htmlToMarkdown } from "@/shared/utils/htmlToMarkdown";
import { AlertCircle, Check, ChevronLeft, LoaderCircle } from "lucide-react";
import styles from "./FormHeader.module.css";

interface FormHeaderProps {
	title: string;
	formDescription?: string | null;
	currentStep: number;
	currentSection?: { title?: string; description?: string } | null;
	onBack?: () => void;
	saveStatus?: "saving" | "error" | "saved";
}

export const FormHeader = ({ title, formDescription, currentStep, currentSection, onBack, saveStatus }: FormHeaderProps) => {
	const normalizedFormDescription = formDescription ? htmlToMarkdown(formDescription) : "";
	const normalizedSectionDescription = currentSection?.description ? htmlToMarkdown(currentSection.description) : "";

	return (
		<div className={styles.header}>
			{(onBack || saveStatus) && (
				<div className={styles.topBar}>
					{onBack && (
						<Button type="button" onClick={onBack} themeColor="var(--foreground)">
							<ChevronLeft size={16} />
							返回表單列表
						</Button>
					)}
					{saveStatus && (
						<div className={styles.saveStatus} aria-live="polite">
							{saveStatus === "saving" ? (
								<>
									<SpinningIcon icon={LoaderCircle} size={16} />
									<span>儲存中</span>
								</>
							) : saveStatus === "error" ? (
								<>
									<AlertCircle size={16} />
									<span>有問題</span>
								</>
							) : (
								<>
									<Check size={16} />
									<span>已儲存</span>
								</>
							)}
						</div>
					)}
				</div>
			)}
			<h1 className={styles.title}>{title}</h1>
			{currentStep === 0 && formDescription && <Markdown className={styles.description} content={normalizedFormDescription} />}
			<h2 className={styles.sectionHeader}>{currentSection?.title}</h2>
			{currentSection?.description && <Markdown className={styles.sectionDescription} content={normalizedSectionDescription} />}
		</div>
	);
};
