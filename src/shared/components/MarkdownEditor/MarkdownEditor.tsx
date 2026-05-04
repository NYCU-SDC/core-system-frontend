import type { ProseMirrorLikeDocument } from "@/shared/utils/proseMirror";
import * as Label from "@radix-ui/react-label";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import { EditorContent, useEditor } from "@tiptap/react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./MarkdownEditor.module.css";

export type MarkdownEditorVariant = "outline" | "flushed";

export interface MarkdownEditorProps {
	value: ProseMirrorLikeDocument | null;
	onChange: (nextValue: ProseMirrorLikeDocument) => void;
	onBlur?: () => void;
	placeholder?: string;
	label?: string;
	error?: string;
	themeColor?: string;
	variant?: MarkdownEditorVariant;
	className?: string;
}

const headingLevels = [1, 2, 3] as [1, 2, 3];

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export const MarkdownEditor = ({ value, onChange, onBlur, placeholder, label, error, themeColor, variant = "outline", className }: MarkdownEditorProps) => {
	const resolvedColor = themeColor?.startsWith("--") ? `var(${themeColor})` : themeColor;
	const [isFocused, setIsFocused] = useState(false);
	const lastSyncedJson = useRef(JSON.stringify(value ?? null));

	// Heading dropdown state
	const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false);
	const headingDropdownRef = useRef<HTMLDivElement>(null);

	// Link dialog state
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkText, setLinkText] = useState("");
	const [linkUrl, setLinkUrl] = useState("");
	const linkDialogRef = useRef<HTMLDivElement>(null);
	const linkUrlInputRef = useRef<HTMLInputElement>(null);

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
		content: value ?? EMPTY_DOC,
		editorProps: {
			attributes: {
				class: "markdown-editor"
			}
		}
	});

	const emitJSON = useCallback(() => {
		if (!editor) return;
		const json = editor.getJSON();
		const serialized = JSON.stringify(json);
		if (serialized === lastSyncedJson.current) return;
		lastSyncedJson.current = serialized;
		onChange(json as ProseMirrorLikeDocument);
	}, [editor, onChange]);

	useEffect(() => {
		if (!editor) return;
		editor.on("update", emitJSON);
		return () => {
			editor.off("update", emitJSON);
		};
	}, [editor, emitJSON]);

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
		const incoming = JSON.stringify(value ?? null);
		if (incoming === lastSyncedJson.current) return;
		lastSyncedJson.current = incoming;
		editor.commands.setContent(value ?? EMPTY_DOC, false);
	}, [editor, value]);

	// Close heading dropdown on click outside
	useEffect(() => {
		if (!headingDropdownOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (headingDropdownRef.current && !headingDropdownRef.current.contains(e.target as Node)) {
				setHeadingDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [headingDropdownOpen]);

	// Close link dialog on click outside
	useEffect(() => {
		if (!linkDialogOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (linkDialogRef.current && !linkDialogRef.current.contains(e.target as Node)) {
				setLinkDialogOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [linkDialogOpen]);

	const currentHeadingLevel = headingLevels.find(level => editor?.isActive("heading", { level })) ?? null;

	const applyHeading = (level: 1 | 2 | 3 | null) => {
		if (!editor) return;
		if (level === null) {
			editor.chain().focus().setParagraph().run();
		} else {
			editor.chain().focus().setHeading({ level }).run();
		}
		setHeadingDropdownOpen(false);
	};

	const openLinkDialog = () => {
		if (!editor) return;
		const { from, to } = editor.state.selection;
		const selectedText = editor.state.doc.textBetween(from, to);
		const existingHref = editor.isActive("link") ? (editor.getAttributes("link").href as string) : "";
		setLinkText(selectedText || "");
		setLinkUrl(existingHref || "");
		setLinkDialogOpen(true);
		// Focus URL input after state update
		setTimeout(() => linkUrlInputRef.current?.focus(), 0);
	};

	const applyLink = () => {
		if (!editor) return;
		if (!linkUrl.trim()) {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			setLinkDialogOpen(false);
			return;
		}

		if (linkText.trim()) {
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.command(({ tr, state }) => {
					const { from, to } = state.selection;
					const mark = state.schema.marks.link?.create({ href: linkUrl.trim(), target: "_blank", rel: "noopener noreferrer" });
					if (!mark) return false;
					tr.replaceWith(from, to, state.schema.text(linkText.trim(), [mark]));
					return true;
				})
				.run();
		} else {
			editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
		}

		setLinkDialogOpen(false);
	};

	const removeLink = () => {
		if (!editor) return;
		editor.chain().focus().extendMarkRange("link").unsetLink().run();
		setLinkDialogOpen(false);
	};

	const toolbarButtons = [
		{
			key: "bold",
			label: "B",
			title: "粗體",
			active: Boolean(editor?.isActive("bold")),
			disabled: !editor,
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
			disabled: !editor,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleItalic().run();
			}
		},
		{
			key: "bullet",
			label: "•",
			title: "無序列表",
			active: Boolean(editor?.isActive("bulletList")),
			disabled: !editor,
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
			disabled: !editor,
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
			disabled: !editor,
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
			disabled: !editor,
			action: () => {
				if (!editor) return;
				editor.chain().focus().toggleCodeBlock().run();
			}
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
					{/* Heading dropdown */}
					<div className={styles.headingWrapper} ref={headingDropdownRef}>
						<button
							type="button"
							title="標題"
							className={`${styles.toolbarButton} ${currentHeadingLevel ? styles.toolbarButtonActive : ""}`}
							onMouseDown={e => {
								e.preventDefault();
								setHeadingDropdownOpen(prev => !prev);
							}}
							disabled={!editor}
						>
							{currentHeadingLevel ? `H${currentHeadingLevel}` : "H"}
							<span className={styles.dropdownArrow}>▾</span>
						</button>
						{headingDropdownOpen && (
							<div className={styles.dropdownMenu}>
								<button
									type="button"
									className={`${styles.dropdownItem} ${currentHeadingLevel === null ? styles.dropdownItemActive : ""}`}
									onMouseDown={e => {
										e.preventDefault();
										applyHeading(null);
									}}
								>
									Normal
								</button>
								{headingLevels.map(level => (
									<button
										key={level}
										type="button"
										className={`${styles.dropdownItem} ${currentHeadingLevel === level ? styles.dropdownItemActive : ""}`}
										onMouseDown={e => {
											e.preventDefault();
											applyHeading(level);
										}}
									>
										H{level}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Flat toolbar buttons */}
					{toolbarButtons.map(button => (
						<button
							key={button.key}
							type="button"
							title={button.title}
							className={`${styles.toolbarButton} ${button.active ? styles.toolbarButtonActive : ""}`}
							onMouseDown={e => {
								e.preventDefault();
								button.action();
							}}
							disabled={button.disabled}
						>
							{button.label}
						</button>
					))}

					{/* Link button with popover */}
					<div className={styles.linkWrapper} ref={linkDialogRef}>
						<button type="button" title="連結" className={`${styles.toolbarButton} ${editor?.isActive("link") ? styles.toolbarButtonActive : ""}`} onClick={openLinkDialog} disabled={!editor}>
							🔗
						</button>
						{linkDialogOpen && (
							<div className={styles.linkPopover}>
								<div className={styles.linkPopoverField}>
									<label className={styles.linkPopoverLabel}>顯示文字</label>
									<input
										type="text"
										className={styles.linkPopoverInput}
										placeholder="顯示文字（選填）"
										value={linkText}
										onChange={e => setLinkText(e.target.value)}
										onKeyDown={e => {
											if (e.key === "Enter") applyLink();
											if (e.key === "Escape") setLinkDialogOpen(false);
										}}
									/>
								</div>
								<div className={styles.linkPopoverField}>
									<label className={styles.linkPopoverLabel}>連結網址</label>
									<input
										ref={linkUrlInputRef}
										type="url"
										className={styles.linkPopoverInput}
										placeholder="https://..."
										value={linkUrl}
										onChange={e => setLinkUrl(e.target.value)}
										onKeyDown={e => {
											if (e.key === "Enter") applyLink();
											if (e.key === "Escape") setLinkDialogOpen(false);
										}}
									/>
								</div>
								<div className={styles.linkPopoverActions}>
									{editor?.isActive("link") && (
										<button type="button" className={styles.linkPopoverRemove} onClick={removeLink}>
											移除連結
										</button>
									)}
									<button type="button" className={styles.linkPopoverApply} onClick={applyLink}>
										確認
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className={editorAreaClasses}>{editor && <EditorContent editor={editor} />}</div>
			</div>
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
};

MarkdownEditor.displayName = "MarkdownEditor";
