import { marked } from "marked";
import { useEffect, useMemo, useRef } from "react";
import styles from "./Markdown.module.css";

export interface MarkdownProps {
	content: string;
	className?: string;
}

export const Markdown = ({ content, className = "" }: MarkdownProps) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		marked.setOptions({ breaks: true, gfm: true });
	}, []);

	const html = useMemo(() => marked.parse(content) as string, [content]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			if (!containerRef.current) return;
			if (!containerRef.current.querySelector("pre code")) return;

			// ✅ highlight.js 改成動態載入
			const hljsModule = await import("highlight.js");
			if (cancelled) return;
			const hljs = hljsModule.default;

			const codeBlocks = containerRef.current.querySelectorAll("pre code");
			codeBlocks.forEach(block => {
				hljs.highlightElement(block as HTMLElement);
			});
		})();

		return () => {
			cancelled = true;
		};
	}, [content]);

	return <div ref={containerRef} className={`${styles.markdown} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};
