import { marked } from "marked";
import type { MutableRefObject } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import styles from "./Markdown.module.css";

export interface MarkdownProps {
	content: string;
	className?: string;
}

export const Markdown = forwardRef<HTMLDivElement, MarkdownProps>(({ content, className = "" }, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		marked.setOptions({ breaks: true, gfm: true });
	}, []);

	const html = useMemo(() => marked.parse(content) as string, [content]);

	const setRefs = useCallback(
		(node: HTMLDivElement | null) => {
			(containerRef as MutableRefObject<HTMLDivElement | null>).current = node;
			if (typeof ref === "function") {
				ref(node);
			} else if (ref) {
				(ref as MutableRefObject<HTMLDivElement | null>).current = node;
			}
		},
		[ref]
	);

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

	return <div ref={setRefs} className={`${styles.markdown} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
});

Markdown.displayName = "Markdown";
