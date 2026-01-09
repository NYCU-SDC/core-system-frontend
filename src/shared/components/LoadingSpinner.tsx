import { Flex, Spinner } from "@radix-ui/themes";

export const LoadingSpinner = () => {
	return (
		<Flex align="center" justify="center" style={{ minHeight: "200px" }}>
			<Spinner size="3" />
		</Flex>
	);
};
