import { Box, Card, Flex, Heading, Switch, Text } from "@radix-ui/themes";

export const SettingsPage = () => {
	return (
		<Box>
			<Heading size="8" mb="2">
				Settings
			</Heading>
			<Text color="gray" mb="6">
				Manage your application settings and preferences.
			</Text>

			<Flex direction="column" gap="4">
				<Card>
					<Box p="5">
						<Heading size="4" mb="4">
							General Settings
						</Heading>
						<Flex direction="column" gap="4">
							<Flex justify="between" align="center">
								<Box>
									<Text weight="medium" size="2">
										Email Notifications
									</Text>
									<Text size="1" color="gray">
										Receive email updates about your account
									</Text>
								</Box>
								<Switch defaultChecked />
							</Flex>

							<Flex justify="between" align="center">
								<Box>
									<Text weight="medium" size="2">
										Dark Mode
									</Text>
									<Text size="1" color="gray">
										Enable dark theme across the application
									</Text>
								</Box>
								<Switch />
							</Flex>

							<Flex justify="between" align="center">
								<Box>
									<Text weight="medium" size="2">
										Auto-save
									</Text>
									<Text size="1" color="gray">
										Automatically save your changes
									</Text>
								</Box>
								<Switch defaultChecked />
							</Flex>
						</Flex>
					</Box>
				</Card>

				<Card>
					<Box p="5">
						<Heading size="4" mb="4">
							Account Settings
						</Heading>
						<Text color="gray">Account management options coming soon.</Text>
					</Box>
				</Card>
			</Flex>
		</Box>
	);
};
