import hljs from "highlight.js";
import { marked } from "marked";
import { useEffect, useRef } from "react";
import styles from "./Markdown.module.css";

export interface MarkdownProps {
	content: string;
	className?: string;
}

export const Markdown = ({ content, className = "" }: MarkdownProps) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Configure marked options
		marked.setOptions({
			breaks: true,
			gfm: true
		});
	}, []);

	useEffect(() => {
		// Apply syntax highlighting to all code blocks after render
		if (containerRef.current) {
			const codeBlocks = containerRef.current.querySelectorAll("pre code");
			codeBlocks.forEach(block => {
				hljs.highlightElement(block as HTMLElement);
			});
		}
	}, [content]);

	const html = marked.parse(content) as string;

	return <div ref={containerRef} className={`${styles.markdown} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};
