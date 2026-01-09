import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export const LoginPage = () => {
	return (
		<Box>
			<Flex direction="column" align="center" gap="6" py="8">
				<Heading size="8">Welcome</Heading>
				<Text color="gray">Sign in to your account</Text>

				<Card style={{ width: "100%", maxWidth: "400px" }}>
					<Flex direction="column" gap="4" p="4">
						<Box>
							<Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
								Email
							</Text>
							<input
								type="email"
								placeholder="Enter your email"
								style={{
									width: "100%",
									padding: "0.5rem",
									borderRadius: "var(--radius-2)",
									border: "1px solid var(--gray-6)",
									fontSize: "14px"
								}}
							/>
						</Box>

						<Box>
							<Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
								Password
							</Text>
							<input
								type="password"
								placeholder="Enter your password"
								style={{
									width: "100%",
									padding: "0.5rem",
									borderRadius: "var(--radius-2)",
									border: "1px solid var(--gray-6)",
									fontSize: "14px"
								}}
							/>
						</Box>

						<Link to="/admin" style={{ textDecoration: "none" }}>
							<Button size="3" style={{ width: "100%" }}>
								<LogIn size={16} />
								Sign In
							</Button>
						</Link>
					</Flex>
				</Card>
			</Flex>
		</Box>
	);
};
