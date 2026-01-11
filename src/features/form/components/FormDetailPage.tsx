import { UserLayout } from "@/layouts";
import { Button, Checkbox, Input, Radio, TextArea } from "@/shared/components";
import { Send } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./FormDetailPage.module.css";

export const FormDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
		agree: false,
		rating: ""
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", formData);
		navigate("/forms");
	};

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>Form {id}</h1>
					<p className={styles.description}>Please fill out all required fields</p>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Basic Information</h2>
						<div className={styles.fields}>
							<Input id="name" label="Full Name" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
							<Input id="email" type="email" label="Email Address" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
						</div>
					</div>

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Your Feedback</h2>
						<div className={styles.fields}>
							<TextArea id="message" label="Message" placeholder="Share your thoughts..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={6} />

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

					<div className={styles.actions}>
						<Button type="button" onClick={() => navigate("/forms")} themeColor="var(--comment)">
							Cancel
						</Button>
						<Button type="submit" icon={Send} disabled={!formData.agree}>
							Submit
						</Button>
					</div>
				</form>
			</div>
		</UserLayout>
	);
};
