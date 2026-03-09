import { Heart, Smile, Star, ThumbsUp, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./InlineSvg.module.css";

interface InlineSvgProps {
	name: string;
	filled: boolean;
	size?: number;
	className?: string;
}

export const InlineSvg = ({ name, filled, size = 24, className }: InlineSvgProps) => {
	const iconProps = {
		size,
		fill: filled ? "currentColor" : "none",
		stroke: "currentColor",
		className
	};

	let iconNode: ReactNode = null;
	switch (name) {
		case "star":
			iconNode = <Star {...iconProps} />;
			break;
		case "heart":
			iconNode = <Heart {...iconProps} />;
			break;
		case "thumbs-up":
			iconNode = <ThumbsUp {...iconProps} />;
			break;
		case "smile":
			iconNode = <Smile {...iconProps} />;
			break;
		case "trophy":
			iconNode = <Trophy {...iconProps} />;
			break;
		default:
			return null;
	}

	return <span className={styles.wrapper}>{iconNode}</span>;
};
