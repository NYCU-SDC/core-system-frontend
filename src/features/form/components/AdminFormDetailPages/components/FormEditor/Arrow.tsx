import { Check, X } from "lucide-react";
import styles from "./Arrow.module.css";

interface ArrowProps extends React.SVGAttributes<SVGSVGElement> {
	type?: "info" | "success" | "fail";
	line?: "solid" | "dashed";
}

export const Arrow = ({ type = "info", line = "solid", className, ...props }: ArrowProps) => {
	return (
		<div className={`${styles.arrowContainer} ${className || ""}`}>
			<svg className={`${styles.arrow}`} {...props} transform="rotate(180)" strokeLinecap="round" strokeLinejoin="round">
				<line x1="50%" y1="0" x2="50%" y2="100%" className={`${styles[type]}`} strokeWidth="2px" strokeDasharray={line === "dashed" ? "4 2" : undefined} />
				<line x1="28" y1="6" x2="32" y2="0" className={`${styles[type]}`} strokeWidth="2px" />
				<line x1="32" y1="0" x2="36" y2="6" className={`${styles[type]}`} strokeWidth="2px" />
			</svg>
			{type === "fail" && <X x="60%" y="50%" size={12} strokeWidth="4px" className={`${styles[type]} ${styles.icon}`} />}
			{type === "success" && <Check x="60%" y="50%" size={12} strokeWidth="4px" className={`${styles[type]} ${styles.icon}`} />}
		</div>
	);
};
