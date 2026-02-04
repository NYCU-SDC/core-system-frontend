import { Check, X } from "lucide-react";
import styles from "./Arrow.module.css";

interface ArrowProps extends React.SVGAttributes<SVGSVGElement> {
	type?: "info" | "success" | "fail";
	line?: "solid" | "dashed";
}

export const Arrow = ({ type = "info", line = "solid", className, ...props }: ArrowProps) => {
	return (
		<div className={`${styles.arrowContainer} ${className || ""}`}>
			<svg className={`${styles.arrow}`} {...props} transform="rotate(180)">
				<line x1="50%" y1="0" x2="50%" y2="100%" className={`${styles[type]}`} strokeWidth="2px" strokeDasharray={line === "dashed" ? "4 2" : undefined} />
				<g transform="translate(28, 0)">
					<line x1="0" y1="8" x2="4" y2="0" className={`${styles[type]}`} strokeWidth="2px" />
					<line x1="4" y1="0" x2="8" y2="8" className={`${styles[type]}`} strokeWidth="2px" />
				</g>
			</svg>
			{type === "fail" && <X x="60%" y="50%" size={12} strokeWidth="4px" className={`${styles[type]} ${styles.icon}`} />}
			{type === "success" && <Check x="60%" y="50%" size={12} strokeWidth="4px" className={`${styles[type]} ${styles.icon}`} />}
		</div>
	);
};
