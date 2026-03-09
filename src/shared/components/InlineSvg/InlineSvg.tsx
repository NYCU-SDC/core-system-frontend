import type { LucideIcon } from "lucide-react";
import { Heart, Smile, Star, ThumbsUp, Trophy } from "lucide-react";
import styles from "./InlineSvg.module.css";

const iconComponentCache = new Map<string, LucideIcon | null>();

interface InlineSvgProps {
	name: string;
	filled: boolean;
	size?: number;
	className?: string;
}

const ICON_MAP = {
	star: Star,
	heart: Heart,
	"thumbs-up": ThumbsUp,
	smile: Smile,
	trophy: Trophy
} as const;

const resolveIconComponent = (name: string): LucideIcon | null => {
	if (iconComponentCache.has(name)) {
		return iconComponentCache.get(name) ?? null;
	}

	const component = (ICON_MAP as Record<string, LucideIcon | undefined>)[name] ?? null;
	iconComponentCache.set(name, component);
	return component;
};

export const InlineSvg = ({ name, filled, size = 24, className }: InlineSvgProps) => {
	const Icon = resolveIconComponent(name);
	if (!Icon) return null;

	return (
		<span className={styles.wrapper}>
			<Icon size={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" className={className} />
		</span>
	);
};
