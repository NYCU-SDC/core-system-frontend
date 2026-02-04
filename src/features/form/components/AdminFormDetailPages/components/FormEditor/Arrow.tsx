import styles from "./Arrow.module.css";

interface ArrowProps extends React.SVGAttributes<SVGSVGElement> {
	type?: "info" | "success" | "fail";
	line?: "solid" | "dashed";
}

export const Arrow = ({ type = "info", line = "solid", className, ...props }: ArrowProps) => {
	return (
		<svg className={`${styles.arrow} ${className || ""}`} {...props}>
			<line x1="50%" y1="0" x2="50%" y2="100%" className={`${styles[type]}`} strokeWidth="2px" strokeDasharray={line === "dashed" ? "4 2" : undefined} />
			<line x1="calc(50% - 0.3rem)" y1="calc(100% - 0.5rem)" x2="50%" y2="100%" className={`${styles[type]}`} strokeWidth="2px" />
			<line x1="calc(50% + 0.3rem)" y1="calc(100% - 0.5rem)" x2="50%" y2="100%" className={`${styles[type]}`} strokeWidth="2px" />
		</svg>
	);
};
