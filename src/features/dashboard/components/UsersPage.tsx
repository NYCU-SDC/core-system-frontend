import { Box, Card, Heading, Table, Text } from "@radix-ui/themes";

const users = [
	{ id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
	{ id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" }
];

export const UsersPage = () => {
	return (
		<Box>
			<Heading size="8" mb="2">
				Users
			</Heading>
			<Text color="gray" mb="6">
				Manage your application users.
			</Text>

			<Card>
				<Box p="4">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{users.map(user => (
								<Table.Row key={user.id}>
									<Table.Cell>{user.name}</Table.Cell>
									<Table.Cell>{user.email}</Table.Cell>
									<Table.Cell>{user.role}</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</Box>
			</Card>
		</Box>
	);
};
