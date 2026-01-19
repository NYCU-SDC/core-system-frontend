import { UserLayout } from "@/layouts";
import { AccountButton, Button, Checkbox, DragToOrder, Input, Radio, SearchableSelect, TextArea } from "@/shared/components";
import { Github } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./FormDetailPage.module.css";

// interface Question {
// 	id: string;
// 	title: string;
// 	type: "text" | "textarea" | "radio" | "checkbox";
// 	options?: { value: string; label: string }[];
// 	required: boolean;
// }

interface Section {
	id: string;
	title: string;
	// questions?: Question[];
	completed: boolean;
}

export const FormDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
		agree: false,
		rating: ""
	});

	const isSectionCompleted = (sectionId: string): boolean => {
		switch (sectionId) {
			case "group-intro":
				return formData.name.trim() !== "" && formData.email.trim() !== "";
			case "personal-info":
				return true;
			default:
				return false;
		}
	};

	const sections: Section[] = [
		{ id: "group-intro", title: "組別介紹", completed: isSectionCompleted("group-intro") },
		{ id: "personal-info", title: "個人資訊", completed: isSectionCompleted("personal-info") },
		{ id: "intro", title: "Full Stack Intro. Training Program", completed: false },
		{ id: "advanced", title: "Full Stack Advanced Training Program", completed: false },
		{ id: "hpc", title: "High Performance Computing Team", completed: false },
		{ id: "project-teams", title: "Project Teams", completed: false },
		{ id: "program-match", title: "Program Match", completed: false },
		{ id: "preview", title: "填答結果預覽", completed: false }
	];

	const isLastStep = currentStep === sections.length - 1;
	const isFirstStep = currentStep === 0;

	const handleNext = () => {
		if (!isLastStep) {
			setCurrentStep(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (!isFirstStep) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const handleSectionClick = (index: number) => {
		setCurrentStep(index);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (currentStep === sections.length - 1) {
			console.log("Form submitted:", formData);
			setIsSubmitted(true);
		}
	};

	if (isSubmitted) {
		return (
			<UserLayout>
				<div className={styles.successContainer}>
					<div className={styles.successBox}>
						<h1 className={styles.successTitle}>感謝您的填答！</h1>
						<p className={styles.successMessage}>
							結果將於 XX/XX 公布，屆時會將信件傳遞至您註冊的 Email 信箱
							<br />
							問卷副本已寄送至您的信箱，如有疑問請洽您的內心。
						</p>
						<div className={styles.successActions}>
							<Button type="button" onClick={() => {}} themeColor="var(--code-foreground)">
								查看問卷副本
							</Button>
							<Button type="button" onClick={() => navigate("/forms")} themeColor="var(--orange)">
								返回主頁
							</Button>
						</div>
					</div>
				</div>
			</UserLayout>
		);
	}

	return (
		<UserLayout>
			<img src="" className={styles.cover} alt="Form Cover" />
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>SDC 註冊表單</h1>
					{currentStep === 0 ? (
						<p className={styles.description}>
							🌟 Welcome to SDC, the Software Development Club! 🌟<br></br>
							<br></br>
							我們是陽明交大軟體開發社（NYCU SDC），旨在聚集交清人才，加速推動兩校在資訊領域的發展，同時引領更多的新人（不限科系）成為人才，♾️ 循環。<br></br>
							<br></br>
							更多資訊請關注 SDC Instagram @nycu_sdc<br></br>
							<br></br>
							請使用您主要的 Google 帳號進行填寫，以便日後聯絡順利。<br></br>
							<br></br>
							此表單內容提交後皆可修改，請安心填寫。
						</p>
					) : (
						<h2 className={styles.sectionHeader}>{sections[currentStep].title}</h2>
					)}
				</div>

				<div className={styles.structure}>
					<div className={styles.structureTitle}>
						<h2>表單結構</h2>
						<p>（可點擊項目返回編輯）</p>
					</div>
					<div style={{ display: "flex", gap: "0.625rem" }}>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--color-caption)" }}></span>
							<p>完成填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--code-foreground)" }}></span>
							<p>待填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--orange)" }}></span>
							<p>目前位置</p>
						</div>
					</div>
					<div className={styles.workflow}>
						{sections.map((section, index) => (
							<button
								key={section.id}
								type="button"
								className={`${styles.workflowButton} ${index === currentStep ? styles.active : ""} ${section.completed ? styles.completed : ""}`}
								onClick={() => handleSectionClick(index)}
							>
								{section.title}
							</button>
						))}
					</div>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					{currentStep === 0 && (
						<div className={styles.section}>
							<div className={styles.fields}>
								<Checkbox id="" label="Full Stack Intro. Training Program" checked={false} onCheckedChange={checked => {}} />
								<Checkbox id="" label="Full Stack Advanced Training Program" checked={false} onCheckedChange={checked => {}} />
								<Checkbox id="" label="High Performance Computing Team" checked={false} onCheckedChange={checked => {}} />
							</div>
						</div>
					)}

					{currentStep === 1 && (
						<div className={styles.section}>
							<div className={styles.fields}>
								<Input id="name" label="中文姓名" placeholder="請輸入文字..." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
								<TextArea id="message" label="Message" placeholder="Share your thoughts..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={6} />
								<SearchableSelect
									label="Email Address"
									placeholder="Select your email domain"
									value={formData.email}
									onValueChange={value => setFormData({ ...formData, email: value })}
									options={[
										{ value: "student.nycu.edu.tw", label: "student.nycu.edu.tw" },
										{ value: "nycu.edu.tw", label: "nycu.edu.tw" },
										{ value: "gmail.com", label: "gmail.com" }
									]}
								/>
								<AccountButton logo={<Github size={24} />} connected>
									GitHub Account
								</AccountButton>
								<Radio
									options={[
										{ value: "5", label: "Excellent" },
										{ value: "4", label: "Good" },
										{ value: "3", label: "Average" },
										{ value: "2", label: "Poor" },
										{ value: "1", label: "Very Poor" }
									]}
									value={formData.rating}
									onValueChange={value => setFormData({ ...formData, rating: value })}
								/>

								<Checkbox id="agree" label="I agree to the terms and conditions" checked={formData.agree} onCheckedChange={checked => setFormData({ ...formData, agree: checked as boolean })} />
							</div>
						</div>
					)}

					{currentStep === 6 && (
						<div className={styles.section}>
							<div className={styles.fields}>
								<DragToOrder
									items={[
										{ id: "project-a", content: "Project A" },
										{ id: "project-b", content: "Project B" },
										{ id: "project-c", content: "Project C" },
										{ id: "project-d", content: "Project D" }
									]}
									onReorder={newOrder => {}}
								/>
							</div>
						</div>
					)}

					{currentStep === 7 && (
						<div className={styles.section}>
							<div className={styles.previewSection}>
								<div className={styles.previewBlock}>
									<div className={styles.previewHeader}>
										<h3 className={styles.previewTitle}>組別介紹</h3>
										<Button type="button" onClick={() => handleSectionClick(0)} themeColor="var(--orange)" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
											返回編輯此項目
										</Button>
									</div>
									<ul className={styles.previewList}>
										{formData.name && (
											<li>
												<strong>Full Name:</strong> {formData.name}
											</li>
										)}
										{formData.email && (
											<li>
												<strong>Email Address:</strong> {formData.email}
											</li>
										)}
									</ul>
								</div>

								<div className={styles.previewBlock}>
									<div className={styles.previewHeader}>
										<h3 className={styles.previewTitle}>個人資訊</h3>
										<Button type="button" onClick={() => handleSectionClick(1)} themeColor="var(--orange)" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
											返回編輯此項目
										</Button>
									</div>
									<ul className={styles.previewList}>
										{formData.message && (
											<li>
												<strong>Message:</strong> {formData.message}
											</li>
										)}
										{formData.rating && (
											<li>
												<strong>Rating:</strong> {formData.rating}
											</li>
										)}
										{formData.agree && (
											<li>
												<strong>Agreement:</strong> 已同意條款
											</li>
										)}
									</ul>
								</div>
							</div>
						</div>
					)}

					<div className={styles.navigation}>
						<Button type="button" onClick={handlePrevious} disabled={isFirstStep} themeColor="var(--foreground)">
							上一頁
						</Button>
						{isLastStep ? (
							<Button type="submit" disabled={!formData.agree}>
								送出
							</Button>
						) : (
							<Button type="button" onClick={handleNext}>
								下一頁
							</Button>
						)}
					</div>
				</form>
			</div>
		</UserLayout>
	);
};
