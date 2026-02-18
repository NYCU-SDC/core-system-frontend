import { useEffect, useState } from "react";

const svgCache = new Map<string, string>();

interface InlineSvgProps {
	name: string;
	filled: boolean;
	size?: number;
	className?: string;
}

export const InlineSvg = ({ name, filled, size = 24, className }: InlineSvgProps) => {
	const [svg, setSvg] = useState<string>(() => svgCache.get(name) || "");

	useEffect(() => {
		if (svgCache.has(name)) {
			return;
		}

		let mounted = true;

		fetch(`/icons/lucide/${name}.svg`)
			.then(res => res.text())
			.then(data => {
				if (!mounted) return;
				svgCache.set(name, data);
				setSvg(data);
			});

		return () => {
			mounted = false;
		};
	}, [name]);

	if (!svg) return null;

	const processed = svg.replace("<svg", `<svg width="${size}" height="${size}" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" class="${className ?? ""}"`);

	return <span dangerouslySetInnerHTML={{ __html: processed }} style={{ display: "inline-flex" }} />;
};
