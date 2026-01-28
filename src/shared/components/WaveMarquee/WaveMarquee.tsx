import wave from "@/assets/icon/wave.svg";
import { useEffect, useState } from "react";
import styles from "./WaveMarquee.module.css";

export const WaveMarquee = () => {
	const [repeatCount, setRepeatCount] = useState(4);

	useEffect(() => {
		const updateCount = () => {
			const setWidth = Math.max(window.innerHeight * 3, window.innerWidth * 1.5);
			const needed = Math.ceil(window.innerWidth / setWidth) + 2;
			setRepeatCount(needed);
		};

		updateCount();
		window.addEventListener("resize", updateCount);
		return () => window.removeEventListener("resize", updateCount);
	}, []);

	const WaveUnit = () => (
		<div className={styles.waveSet}>
			<img src={wave} alt="wave" className={styles.normal} />
			<img src={wave} alt="wave" className={styles.flipped} />
		</div>
	);

	return (
		<div className={styles.wrapper}>
			<div className={`${styles.track} ${styles.backTrack}`}>
				{Array.from({ length: repeatCount * 2 }).map((_, i) => (
					<WaveUnit key={i} />
				))}
			</div>
			<div className={`${styles.track} ${styles.frontTrack}`}>
				{Array.from({ length: repeatCount * 2 }).map((_, i) => (
					<WaveUnit key={i} />
				))}
			</div>
		</div>
	);
};
