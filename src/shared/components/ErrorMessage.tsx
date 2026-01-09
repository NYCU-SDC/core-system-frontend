import { Callout } from "@radix-ui/themes";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
	message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
	return (
		<Callout.Root color="red" role="alert">
			<Callout.Icon>
				<AlertCircle size={20} />
			</Callout.Icon>
			<Callout.Text>{message}</Callout.Text>
		</Callout.Root>
	);
};
