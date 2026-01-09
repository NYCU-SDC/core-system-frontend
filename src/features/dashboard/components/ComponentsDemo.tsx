import { Edit, Github, Save, Settings, Trash } from "lucide-react";
import { useState } from "react";
import { UserLayout } from "../../../layouts";
import type { DragItem } from "../../../shared/components";
import {
	AccountButton,
	Badge,
	Button,
	Checkbox,
	ColorPicker,
	Dialog,
	DragToOrder,
	DropdownMenu,
	FileUpload,
	Input,
	Label,
	ProgressBar,
	Radio,
	RadioCard,
	SearchableSelect,
	Select,
	Switch,
	TextArea,
	Toast,
	ToastProvider,
	Tooltip
} from "../../../shared/components";
import styles from "./ComponentsDemo.module.css";

export function ComponentsDemo() {
	const [switchValue, setSwitchValue] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [toastOpen, setToastOpen] = useState(false);
	const [progress, setProgress] = useState(45);
	const [selectedColor, setSelectedColor] = useState("#ff5555");
	const [dragItems, setDragItems] = useState<DragItem[]>([
		{ id: "1", content: "First item" },
		{ id: "2", content: "Second item" },
		{ id: "3", content: "Third item" }
	]);

	return (
		<ToastProvider>
			<UserLayout>
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
						<Button onClick={() => setToastOpen(true)}>Show Toast</Button>
						<Toast open={toastOpen} onOpenChange={setToastOpen} title="Success!" description="Your changes have been saved." variant="success" />
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
				</div>
			</UserLayout>
		</ToastProvider>
	);
}
