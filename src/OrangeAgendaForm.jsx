import { useState } from "react";
import {
	Button,
	Dialog,
	DialogTrigger,
	DialogContent,
	// Input,
	Label,
	Select,
	SelectItem,
	Checkbox,
	RadioGroup,
	RadioGroupItem,
	Switch,
	Slider,
} from "@nycu-sdc/orange-agenda";
import "@nycu-sdc/orange-agenda/styles";

export default function OrangeAgendaForm() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		option: "",
		agree: false,
		rating: 50,
		notification: false,
	});
	const [submitted, setSubmitted] = useState(false);

	const handleChange = e => {
		const { name, value, type, checked } = e.target;
		setForm(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSelect = value => setForm(prev => ({ ...prev, option: value }));
	const handleRadio = value => setForm(prev => ({ ...prev, option: value }));
	const handleSlider = value => setForm(prev => ({ ...prev, rating: value[0] }));
	const handleSwitch = value => setForm(prev => ({ ...prev, notification: value }));

	const handleSubmit = e => {
		e.preventDefault();
		setSubmitted(true);
	};

	return (
		<div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
			<h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Orange Agenda Form</h2>
			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", flexDirection: "column", gap: 16 }}
			>
				<Label htmlFor="name">Name</Label>
				{/* <Input
					id="name"
					name="name"
					value={form.name}
					onChange={handleChange}
					required
				/> */}

				<Label htmlFor="email">Email</Label>
				{/* <Input
					id="email"
					name="email"
					value={form.email}
					onChange={handleChange}
					required
					type="email"
				/> */}

				<Label htmlFor="option">Select an option</Label>
				<Select
					value={form.option}
					onValueChange={handleSelect}
				>
					<SelectItem value="dd">Choose...</SelectItem>
					<SelectItem value="A">Option A</SelectItem>
					<SelectItem value="B">Option B</SelectItem>
				</Select>

				<Label>Radio Choice</Label>
				<RadioGroup
					value={form.option}
					onValueChange={handleRadio}
				>
					<RadioGroupItem
						value="A"
						id="radioA"
					/>{" "}
					<Label htmlFor="radioA">A</Label>
					<RadioGroupItem
						value="B"
						id="radioB"
					/>{" "}
					<Label htmlFor="radioB">B</Label>
				</RadioGroup>

				<Label htmlFor="agree">
					<Checkbox
						id="agree"
						name="agree"
						checked={form.agree}
						onCheckedChange={checked => setForm(prev => ({ ...prev, agree: checked }))}
					/>{" "}
					I agree
				</Label>

				<Label>Rating</Label>
				<Slider
					min={0}
					max={100}
					step={1}
					value={[form.rating]}
					onValueChange={handleSlider}
				/>
				<div>Value: {form.rating}</div>

				<Label htmlFor="notification">Enable Notification</Label>
				<Switch
					checked={form.notification}
					onCheckedChange={handleSwitch}
				/>

				<Button type="submit">Submit</Button>
			</form>
			{submitted && (
				<Dialog
					open={submitted}
					onOpenChange={setSubmitted}
				>
					<DialogContent
						title="Form Submitted"
						description="Thank you for submitting!"
					>
						<pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 4 }}>{JSON.stringify(form, null, 2)}</pre>
						<Button onClick={() => setSubmitted(false)}>Close</Button>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
