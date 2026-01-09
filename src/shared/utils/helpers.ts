import { clsx, type ClassValue } from "clsx";

// Utility function for conditional class names
export const cn = (...inputs: ClassValue[]) => {
	return clsx(inputs);
};

// Format currency
export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric"
	}).format(new Date(date));
};
