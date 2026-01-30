import { useEffect, useRef, useState } from "react";
import styles from "./NameMarquee.module.css";

interface NameMarqueeProps {
	name: string;
	speed?: number; // px per second
}

export const NameMarquee = ({ name, speed = 60 }: NameMarqueeProps) => {
	const [lineCount, setLineCount] = useState(0);
	const [duration, setDuration] = useState(80);
	const trackRef = useRef<HTMLDivElement>(null);

	// Calculate line count
	useEffect(() => {
		const FONT_SIZE_REM = 5;
		const LINE_HEIGHT = FONT_SIZE_REM * 16 * 1.5;
		const BUFFER_LINES = 2;

		const update = () => {
			setLineCount(Math.ceil(window.innerHeight / LINE_HEIGHT) + BUFFER_LINES);
		};

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	// Animate duration
	useEffect(() => {
		if (!trackRef.current) return;

		const measure = () => {
			const width = trackRef.current!.getBoundingClientRect().width;

			// 避免極端值
			const minDuration = 20;
			const maxDuration = 240;

			const pxPerSecond = speed;
			const calculated = width / pxPerSecond;

			setDuration(Math.min(Math.max(calculated, minDuration), maxDuration));
		};

		measure();

		// Resize
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [name, speed]);

	return (
		<div className={styles.overlay}>
			{Array.from({ length: lineCount }).map((_, i) => (
				<div key={i} className={styles.row} style={{ animationDuration: `${duration}s` }}>
					{Array.from({ length: 2 }).map((_, k) => (
						<div key={k} className={styles.track} ref={k === 0 ? trackRef : undefined}>
							{Array.from({ length: 20 }).map((_, j) => (
								<span key={j} className={styles.name}>
									{name}
								</span>
							))}
						</div>
					))}
				</div>
			))}
		</div>
	);
};
