import { type LucideProps } from "lucide-react";
import styles from "./SpinningIcon.module.css";

interface SpinningIconProps {
	icon: React.ComponentType<LucideProps>;
	size?: number;
}

export const SpinningIcon = ({ icon: Icon, size = 16 }: SpinningIconProps) => {
	return <Icon size={size} className={styles.spinningIcon} />;
};
