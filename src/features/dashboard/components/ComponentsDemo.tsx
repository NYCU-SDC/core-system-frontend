import { UserLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import type { DragItem, TableColumn } from "@/shared/components";
import {
	AccountButton,
	Badge,
	Button,
	Checkbox,
	ColorPicker,
	DateInput,
	DetailedCheckbox,
	Dialog,
	DragToOrder,
	DropdownMenu,
	FileUpload,
	Input,
	Label,
	Markdown,
	Popover,
	ProgressBar,
	Radio,
	RadioCard,
	ScaleInput,
	SearchableSelect,
	Select,
	Switch,
	Table,
	TextArea,
	Tooltip,
	useToast
} from "@/shared/components";
import { Edit, Github, Save, Settings, Trash } from "lucide-react";
import { useState } from "react";
import styles from "./ComponentsDemo.module.css";

export const ComponentsDemo = () => {
	const { pushToast } = useToast();
	const meta = useSeo({ rule: SEO_CONFIG.adminPage });
	const [switchValue, setSwitchValue] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [progress, setProgress] = useState(45);
	const [selectedColor, setSelectedColor] = useState("#ff5555");
	const [dateValue, setDateValue] = useState("");
	const [scaleValue, setScaleValue] = useState("");
	const [ratingValue, setRatingValue] = useState("");
	const [dragItems, setDragItems] = useState<DragItem[]>([
		{ id: "1", content: "First item" },
		{ id: "2", content: "Second item" },
		{ id: "3", content: "Third item" }
	]);

	return (
		<UserLayout>
			{meta}
			<div className={styles.container}>
				<h1>Components Demo</h1>

				<section className={styles.section}>
					<h2>Buttons</h2>
					<div className={styles.row}>
						<Button>Primary Button</Button>
						<Button variant="secondary">Secondary Button</Button>
						<Button icon={Save}>With Icon</Button>
						<Button processing>Processing</Button>
						<Button disabled>Disabled</Button>
						<Button themeColor="var(--purple)">Custom Color</Button>
					</div>
				</section>

				<section className={styles.section}>
					<h2>Inputs</h2>
					<Input label="Email" placeholder="Enter your email" />
					<Input label="Password" type="password" error="Password is required" />
					<TextArea label="Message" placeholder="Enter your message" rows={4} />
				</section>

				<section className={styles.section}>
					<h2>Label with Required</h2>
					<Label required htmlFor="test">
						Required Field
					</Label>
					<Input id="test" placeholder="This field is required" />
				</section>

				<section className={styles.section}>
					<h2>Switch</h2>
					<Switch label="Enable notifications" checked={switchValue} onCheckedChange={setSwitchValue} />
				</section>

				<section className={styles.section}>
					<h2>Checkboxes & Radio</h2>
					<Checkbox label="Accept terms and conditions" />
					<Checkbox label="Subscribe to newsletter" themeColor="var(--green)" />
					<Radio
						options={[
							{ value: "1", label: "Option 1" },
							{ value: "2", label: "Option 2" },
							{ value: "3", label: "Option 3" }
						]}
					/>
				</section>

				<section className={styles.section}>
					<h2>Detailed Checkbox</h2>
					<div className={styles.column}>
						<DetailedCheckbox id="option1" title="Frontend Development" description="Build modern web interfaces with React and TypeScript<br />React is cool.<br />Very Cool" />
						<DetailedCheckbox id="option2" title="Backend Development" description="Create robust APIs and server-side applications" />
						<DetailedCheckbox id="option3" title="DevOps & Infrastructure" description="Manage cloud infrastructure and CI/CD pipelines" />
					</div>
				</section>

				<section className={styles.section}>
					<h2>Date Input</h2>
					<DateInput
						id="date-demo"
						label="Select a date"
						description="Choose your preferred date"
						value={dateValue}
						onChange={setDateValue}
						options={{ hasYear: true, hasMonth: true, hasDay: true }}
					/>
					<DateInput
						id="month-year-demo"
						label="Graduation Date"
						description="Select month and year only"
						value={dateValue}
						onChange={setDateValue}
						options={{ hasYear: true, hasMonth: true, hasDay: false }}
					/>
				</section>

				<section className={styles.section}>
					<h2>Scale Input (Linear)</h2>
					<ScaleInput
						id="scale-demo"
						label="Rate your experience"
						description="How would you rate your experience with this product?"
						value={scaleValue}
						onChange={setScaleValue}
						options={{
							minVal: 0,
							maxVal: 10,
							minValueLabel: "Poor",
							maxValueLabel: "Excellent"
						}}
					/>
				</section>

				<section className={styles.section}>
					<h2>Scale Input (Rating Stars)</h2>
					<ScaleInput
						id="rating-demo"
						label="Overall Satisfaction"
						description="Rate your overall satisfaction"
						value={ratingValue}
						onChange={setRatingValue}
						options={{
							minVal: 1,
							maxVal: 5,
							icon: "star",
							minValueLabel: "Not satisfied",
							maxValueLabel: "Very satisfied"
						}}
					/>
				</section>

				<section className={styles.section}>
					<h2>Scale Input (Rating Hearts)</h2>
					<ScaleInput
						id="hearts-demo"
						label="How much do you love it?"
						value={ratingValue}
						onChange={setRatingValue}
						options={{
							minVal: 1,
							maxVal: 5,
							icon: "heart"
						}}
					/>
				</section>

				<section className={styles.section}>
					<h2>Select</h2>
					<Select
						label="Choose option"
						options={[
							{ value: "1", label: "Option 1" },
							{ value: "2", label: "Option 2" },
							{ value: "3", label: "Option 3" }
						]}
					/>
				</section>

				<section className={styles.section}>
					<h2>Searchable Select</h2>
					<SearchableSelect
						label="Search and select"
						options={[
							{ value: "1", label: "Apple" },
							{ value: "2", label: "Banana" },
							{ value: "3", label: "Cherry" },
							{ value: "4", label: "Date" },
							{ value: "5", label: "Elderberry" }
						]}
					/>
				</section>

				<section className={styles.section}>
					<h2>Dropdown Menu</h2>
					<DropdownMenu
						trigger="Actions"
						items={[
							{ label: "Edit", icon: Edit, onSelect: () => console.log("Edit") },
							{ label: "Delete", icon: Trash, onSelect: () => console.log("Delete") },
							"separator",
							{ type: "label", label: "Account" },
							{ label: "Settings", icon: Settings, onSelect: () => console.log("Settings") }
						]}
					/>
				</section>

				<section className={styles.section}>
					<h2>Dialog</h2>
					<Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
					<Dialog
						open={dialogOpen}
						onOpenChange={setDialogOpen}
						title="Confirm Action"
						description="Are you sure you want to proceed?"
						footer={
							<>
								<Button variant="secondary" onClick={() => setDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={() => setDialogOpen(false)}>Confirm</Button>
							</>
						}
					>
						<p>This action cannot be undone.</p>
					</Dialog>
				</section>

				<section className={styles.section}>
					<h2>Progress Bar</h2>
					<ProgressBar value={progress} label="Upload Progress" />
					<div className={styles.row}>
						<Button onClick={() => setProgress(Math.max(0, progress - 10))}>-10%</Button>
						<Button onClick={() => setProgress(Math.min(100, progress + 10))}>+10%</Button>
					</div>
				</section>

				<section className={styles.section}>
					<h2>File Upload</h2>
					<FileUpload label="Profile Picture" />
				</section>

				<section className={styles.section}>
					<h2>Account Button</h2>
					<AccountButton logo={<Github size={24} />}>Connect GitHub Account</AccountButton>
					<AccountButton logo={<Github size={24} />} connected>
						GitHub Account
					</AccountButton>
				</section>

				<section className={styles.section}>
					<h2>Badges</h2>
					<div className={styles.row}>
						<Badge variant="success">Success</Badge>
						<Badge variant="error">Error</Badge>
						<Badge variant="warning">Warning</Badge>
						<Badge variant="info">Info</Badge>
						<Badge variant="default">Default</Badge>
						<Badge variant="success" showDot>
							Active
						</Badge>
					</div>
				</section>

				<section className={styles.section}>
					<h2>Radio Card</h2>
					<RadioCard
						options={[
							{
								value: "basic",
								title: "Basic Plan",
								description: "Perfect for getting started. Includes 10 GB storage and basic features."
							},
							{
								value: "pro",
								title: "Pro Plan",
								description: "For professionals. Includes 100 GB storage and advanced features."
							},
							{
								value: "enterprise",
								title: "Enterprise Plan",
								description: "For large teams. Unlimited storage and premium support."
							}
						]}
					/>
				</section>

				<section className={styles.section}>
					<h2>Color Picker</h2>
					<ColorPicker label="Choose theme color" value={selectedColor} onChange={setSelectedColor} />
				</section>

				<section className={styles.section}>
					<h2>Drag to Order</h2>
					<DragToOrder items={dragItems} onReorder={items => setDragItems(items)} />
				</section>

				<section className={styles.section}>
					<h2>Tooltip</h2>
					<Tooltip content="This is a helpful tooltip">
						<Button>Hover me</Button>
					</Tooltip>
				</section>

				<section className={styles.section}>
					<h2>Toast</h2>
					<Button
						onClick={() =>
							pushToast({
								title: "Success!",
								description: "Your changes have been saved.",
								variant: "success"
							})
						}
					>
						Show Toast
					</Button>
				</section>

				<section className={styles.section}>
					<h2>Typography</h2>
					<p>
						Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save
					</p>
					<blockquote>
						<p>This is a blockquote with some example text to demonstrate the styling.</p>
						<cite>— Author Name</cite>
					</blockquote>
				</section>

				<section className={styles.section}>
					<h2>Table</h2>

					{(() => {
						const columns: TableColumn[] = [
							{ key: "name", header: "名字", width: "fixed", fixedWidth: "8rem" },
							{ key: "studentId", header: "學號", width: "fixed", fixedWidth: "8rem" },
							{ key: "dept", header: "科系", width: "fixed", fixedWidth: "6rem" },
							{ key: "school", header: "學校", width: "fixed", fixedWidth: "8rem" },
							{ key: "group", header: "組別", width: "fixed", fixedWidth: "8rem" },
							{ key: "email", header: "電子郵件", width: "fixed", fixedWidth: "12rem" },
							{ key: "q1", header: "Q1 整體滿意度", width: "fixed", fixedWidth: "8rem" },
							{ key: "q2", header: "Q2 整體滿意度", width: "fixed", fixedWidth: "8rem" }
						];

						const rows = [
							{ name: "毛宥鈞", studentId: "114567890", dept: "資工系", school: "陽明交大", group: "Core System", email: "abc@gmail.com", q1: "非常滿意" },
							{ name: "王小明", studentId: "113456789", dept: "電機系", school: "台灣大學", group: "React", email: "wang@example.com", q1: "滿意" },
							{ name: "李小華", studentId: "112345678", dept: "資管系", school: "政治大學", group: "Backend", email: "li@example.com", q1: "普通" }
						];

						const manyRows = [
							...rows,
							{ name: "陳小美", studentId: "111234567", dept: "資工系", school: "成功大學", group: "Frontend", email: "chen@example.com", q1: "非常滿意", q2: "非常滿意" },
							{ name: "林大仁", studentId: "110123456", dept: "電機系", school: "清華大學", group: "DevOps", email: "lin@example.com", q1: "滿意", q2: "非常滿意" },
							{ name: "張小龍", studentId: "109012345", dept: "資管系", school: "中央大學", group: "Core System", email: "zhang@example.com", q1: "非常滿意", q2: "非常滿意" },
							{ name: "劉小玉", studentId: "108901234", dept: "資工系", school: "陽明交大", group: "Backend", email: "liu@example.com", q1: "普通", q2: "非常滿意" },
							{ name: "黃大明", studentId: "107890123", dept: "電機系", school: "台灣大學", group: "React", email: "huang@example.com", q1: "滿意", q2: "非常滿意" }
						];

						type ReviewStatus = "approved" | "rejected" | "pending";
						const statusConfig: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
							approved: { label: "已通過", color: "#000000", bg: "var(--green)" },
							rejected: { label: "已拒絕", color: "#000000", bg: "var(--red)" },
							pending: { label: "待審核", color: "#000000", bg: "var(--orange)" }
						};
						const reviewRows: Array<{ name: string; submittedAt: string; score: number; status: ReviewStatus }> = [
							{ name: "EM", submittedAt: "2025-05-03", score: 99, status: "approved" },
							{ name: "Alice", submittedAt: "2025-05-04", score: 52, status: "rejected" },
							{ name: "Bob", submittedAt: "2025-05-05", score: 71, status: "pending" }
						];
						const reviewColumns: TableColumn[] = [
							{ key: "name", header: "填答者", width: "fixed", fixedWidth: "7rem" },
							{ key: "submittedAt", header: "提交日期", width: "fixed", fixedWidth: "8rem", align: "center" },
							{
								key: "score",
								header: "分數",
								width: "fixed",
								fixedWidth: "5rem",
								align: "right",
								render: (value: number) => <span style={{ fontWeight: 600, color: value >= 80 ? "var(--green)" : value >= 60 ? "var(--orange)" : "var(--red)" }}>{value}</span>
							},
							{
								key: "status",
								header: "狀態",
								width: "fixed",
								fixedWidth: "6rem",
								align: "center",
								render: (value: ReviewStatus) => {
									const cfg = statusConfig[value];
									return <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>;
								}
							}
						];

						return (
							<>
								<p>borderStyle: none & align: left</p>
								<Table columns={columns} data={rows} borderStyle="none" align="left" />

								<p>borderStyle: horizontal & density: compact</p>
								<Table columns={columns} data={manyRows} borderStyle="horizontal" density="compact" showRowNumber />

								<p>render + per-column align（狀態 badge、分數條件色）</p>
								<Table columns={reviewColumns} data={reviewRows} borderStyle="full" showRowNumber />

								<p>maxHeight + 橫向捲軸 + stickyHeader</p>
								<Table columns={columns} data={manyRows} borderStyle="full" showRowNumber containerClassName={styles.tableMaxHeight} stickyHeader />

								<p>自動產生欄位（defaultColumnWidth，不需手動定義 columns）</p>
								<Table data={rows} defaultColumnWidth="8rem" borderStyle="full" showRowNumber />

								<p>empty state</p>
								<Table columns={columns} data={[]} borderStyle="full" />
							</>
						);
					})()}
				</section>

				<section className={styles.section}>
					<h2>Popover</h2>
					<div className={styles.row}>
						<Popover content={<p>This is the content of the popover.</p>}>
							<Button>Open Popover</Button>
						</Popover>
					</div>
				</section>

				<section className={styles.section}>
					<h2>Markdown with Code Highlighting</h2>
					<Markdown
						content={`# Markdown 範例

這是一個支援 **Markdown** 和語法高亮的元件！

## 程式碼區塊

### JavaScript
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

const result = greet('World');
\`\`\`

### TypeScript
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
};
\`\`\`

### Python
\`\`\`python
def calculate_sum(numbers):
    """Calculate the sum of a list of numbers"""
    return sum(numbers)

result = calculate_sum([1, 2, 3, 4, 5])
print(f"Sum: {result}")
\`\`\`

## 其他功能

- 支援清單
- **粗體** 和 *斜體*
- [連結](https://example.com)
- \`行內程式碼\`

> 這是一個引用區塊
> 可以有多行內容`}
					/>
				</section>
			</div>
		</UserLayout>
	);
};
