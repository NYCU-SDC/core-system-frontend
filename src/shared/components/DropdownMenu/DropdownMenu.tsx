import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./DropdownMenu.module.css";

export interface DropdownMenuItem {
	label: string;
	icon?: LucideIcon;
	onSelect?: () => void;
	disabled?: boolean;
}

export interface DropdownMenuProps {
	trigger: ReactNode;
	items: (DropdownMenuItem | "separator" | { type: "label"; label: string })[];
	align?: "start" | "center" | "end";
}

export const DropdownMenu = ({ trigger, items, align = "start" }: DropdownMenuProps) => {
	return (
		<DropdownMenuPrimitive.Root>
			<DropdownMenuPrimitive.Trigger asChild>
				<button className={styles.trigger}>
					{trigger}
					<span className={styles.icon}>
						<ChevronDown size={16} />
					</span>
				</button>
			</DropdownMenuPrimitive.Trigger>

			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content className={styles.content} align={align} sideOffset={5}>
					{items.map((item, index) => {
						if (item === "separator") {
							return <DropdownMenuPrimitive.Separator key={index} className={styles.separator} />;
						}

						if (typeof item === "object" && "type" in item && item.type === "label") {
							return (
								<DropdownMenuPrimitive.Label key={index} className={styles.label}>
									{item.label}
								</DropdownMenuPrimitive.Label>
							);
						}

						const menuItem = item as DropdownMenuItem;
						const Icon = menuItem.icon;

						return (
							<DropdownMenuPrimitive.Item key={index} className={styles.item} onSelect={menuItem.onSelect} disabled={menuItem.disabled}>
								{Icon && (
									<span className={styles.icon}>
										<Icon size={16} />
									</span>
								)}
								{menuItem.label}
							</DropdownMenuPrimitive.Item>
						);
					})}
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</DropdownMenuPrimitive.Root>
	);
};
