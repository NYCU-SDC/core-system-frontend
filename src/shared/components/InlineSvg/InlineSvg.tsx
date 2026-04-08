import { Heart, Smile, Star, ThumbsUp, Trophy } from "lucide-react";
import styles from "./InlineSvg.module.css";

interface InlineSvgProps {
	name: string;
	filled: boolean;
	size?: number;
	className?: string;
}

const iconMap = {
	star: Star,
	heart: Heart,
	"thumbs-up": ThumbsUp,
	smile: Smile,
	trophy: Trophy
} as const;

export const InlineSvg = ({ name, filled, size = 24, className }: InlineSvgProps) => {
	const Icon = iconMap[name as keyof typeof iconMap];

	if (!Icon) return null;

	return (
		<span className={styles.wrapper}>
			<Icon size={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" className={className} />
		</span>
	);
};
