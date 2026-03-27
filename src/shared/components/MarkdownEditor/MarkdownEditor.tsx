import * as Label from "@radix-ui/react-label";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import { htmlToMarkdown } from "@/shared/utils/htmlToMarkdown";
import { EditorContent, useEditor } from "@tiptap/react";
import { marked } from "marked";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./MarkdownEditor.module.css";

export type MarkdownEditorVariant = "outline" | "flushed";

export interface MarkdownEditorProps {
	value: string;
	onChange: (nextValue: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	label?: string;
	error?: string;
	themeColor?: string;
	variant?: MarkdownEditorVariant;
	className?: string;
}

const headingLevels = [1, 2, 3] as [1, 2, 3];

const markdownToHtml = (markdown: string) => {
	if (!markdown) return "";
	return marked.parse(markdown, { gfm: true, breaks: true }) as string;
};

export const MarkdownEditor = ({ value, onChange, onBlur, placeholder, label, error, themeColor, variant = "outline", className }: MarkdownEditorProps) => {
	const resolvedColor = themeColor?.startsWith("--") ? `var(${themeColor})` : themeColor;
	const [isFocused, setIsFocused] = useState(false);
	const lastSyncedMarkdown = useRef(value ?? "");

	const placeholderText = useMemo(() => placeholder ?? "輸入 Markdown 內容…", [placeholder]);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: headingLevels
				}
			}),
			Link.configure({
				openOnClick: false,
				linkOnPaste: true,
				HTMLAttributes: {
					target: "_blank",
					rel: "noopener noreferrer"
				}
			}),
			Placeholder.configure({
				placeholder: placeholderText
			})
		],
		content: value ? markdownToHtml(value) : "",
		editorProps: {
			attributes: {
				class: "markdown-editor"
			}
		}
	});

	const emitMarkdown = useCallback(() => {
		if (!editor) return;
		const html = editor.getHTML();
		const markdown = htmlToMarkdown(html);
		if (markdown === lastSyncedMarkdown.current) return;
		lastSyncedMarkdown.current = markdown;
		onChange(markdown);
	}, [editor, onChange]);

	useEffect(() => {
		if (!editor) return;
		editor.on("update", emitMarkdown);
		return () => {
			editor.off("update", emitMarkdown);
		};
	}, [editor, emitMarkdown]);

	useEffect(() => {
		if (!editor || !onBlur) return;
		const handleBlur = () => onBlur();
		editor.on("blur", handleBlur);
		return () => {
			editor.off("blur", handleBlur);
		};
	}, [editor, onBlur]);

	useEffect(() => {
		if (!editor) return;
		const handleFocus = () => setIsFocused(true);
		const handleBlur = () => setIsFocused(false);
		editor.on("focus", handleFocus);
		editor.on("blur", handleBlur);
		return () => {
			editor.off("focus", handleFocus);
			editor.off("blur", handleBlur);
		};
	}, [editor]);

	useEffect(() => {
		if (!editor) return;
		if (value === lastSyncedMarkdown.current) return;
		lastSyncedMarkdown.current = value;
		const html = value ? markdownToHtml(value) : "";
		editor.commands.setContent(html || "<p></p>", false);
	}, [editor, value]);

	const cycleHeading = () => {
		if (!editor) return;
		const currentLevel = headingLevels.find(level => editor.isActive("heading", { level })) ?? null;
		if (currentLevel === null) {
			editor.chain().focus().toggleHeading({ level: headingLevels[0] }).run();
			return;
		}
		const currentIndex = headingLevels.indexOf(currentLevel);
		const nextIndex = currentIndex + 1;
		if (nextIndex >= headingLevels.length) {
			editor.chain().focus().setParagraph().run();
		} else {
			editor.chain().focus().toggleHeading({ level: headingLevels[nextIndex] }).run();
		}
	};

	const handleToggleLink = () => {
		if (!editor) return;
		if (editor.isActive("link")) {
			editor.chain().focus().unsetLink().run();
			return;
		}
		const url = window.prompt("請輸入連結網址");
		if (!url) return;
		editor.chain().focus().setLink({ href: url }).run();
	};

	const toolbarButtons = [
		{
			key: "heading",
			label: "H",
			title: "標題",
			active: headingLevels.some(level => editor?.isActive("heading", { level })),
			disabled: !editor,
			action: cycleHeading
		},
		{
			key: "bold",
			label: "B",
			title: "粗體",
			active: Boolean(editor?.isActive("bold")),
			disabled: editor ? !editor.can().chain().focus().toggleBold().run() : true,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleBold().run();
			}
		},
		{
			key: "italic",
			label: "I",
			title: "斜體",
			active: Boolean(editor?.isActive("italic")),
			disabled: editor ? !editor.can().chain().focus().toggleItalic().run() : true,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleItalic().run();
			}
		},
		{
			key: "strike",
			label: "S",
			title: "刪除線",
			active: Boolean(editor?.isActive("strike")),
			disabled: editor ? !editor.can().chain().focus().toggleStrike().run() : true,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleStrike().run();
			}
		},
		{
			key: "bullet",
			label: "•",
			title: "無序列表",
			active: Boolean(editor?.isActive("bulletList")),
			disabled: editor ? !editor.can().chain().focus().toggleBulletList().run() : true,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleBulletList().run();
			}
		},
		{
			key: "ordered",
			label: "1.",
			title: "有序列表",
			active: Boolean(editor?.isActive("orderedList")),
			disabled: editor ? !editor.can().chain().focus().toggleOrderedList().run() : true,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleOrderedList().run();
			}
		},
		{
			key: "quote",
			label: "❝",
			title: "引用",
			active: Boolean(editor?.isActive("blockquote")),
			disabled: editor ? !editor.can().chain().focus().toggleBlockquote().run() : true,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleBlockquote().run();
			}
		},
		{
			key: "code",
			label: "</>",
			title: "程式碼區塊",
			active: Boolean(editor?.isActive("codeBlock")),
			disabled: editor ? !editor.can().chain().focus().toggleCodeBlock().run() : true,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleCodeBlock().run();
			}
		},
		{
			key: "link",
			label: "🔗",
			title: "連結",
			active: Boolean(editor?.isActive("link")),
			disabled: !editor,
			action: handleToggleLink
		}
	];

	const shellClasses = [styles.editorShell, variant === "flushed" ? styles.flushed : "", isFocused ? styles.focused : "", className ?? ""].filter(Boolean).join(" ");

	const editorAreaClasses = [styles.editorArea, variant === "flushed" ? styles.flushedContent : ""].filter(Boolean).join(" ");

	const shellStyle: (CSSProperties & Record<string, string>) | undefined = resolvedColor ? { "--editor-focus-color": resolvedColor } : undefined;

	return (
		<div className={styles.wrapper}>
			{label && <Label.Root className={styles.label}>{label}</Label.Root>}
			<div className={shellClasses} style={shellStyle}>
				<div className={styles.toolbar}>
					{toolbarButtons.map(button => (
						<button
							key={button.key}
							type="button"
							title={button.title}
							className={`${styles.toolbarButton} ${button.active ? styles.toolbarButtonActive : ""}`}
							onClick={button.action}
							disabled={button.disabled}
						>
							{button.label}
						</button>
					))}
				</div>
				<div className={editorAreaClasses}>{editor && <EditorContent editor={editor} />}</div>
			</div>
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
};

MarkdownEditor.displayName = "MarkdownEditor";
