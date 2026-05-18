import type { ProseMirrorLikeDocument } from "@/shared/utils/proseMirror";
import { EMPTY_PROSE_MIRROR_DOC } from "@/shared/utils/proseMirror";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export interface ProseMirrorViewerProps {
	content: ProseMirrorLikeDocument | null | undefined;
	className?: string;
}

export const ProseMirrorViewer = ({ content, className }: ProseMirrorViewerProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({
				openOnClick: true,
				HTMLAttributes: {
					target: "_blank",
					rel: "noopener noreferrer"
				}
			})
		],
		content: content ?? EMPTY_PROSE_MIRROR_DOC,
		editable: false,
		editorProps: {
			attributes: {
				class: className ?? ""
			}
		}
	});

	return <EditorContent editor={editor} />;
};

ProseMirrorViewer.displayName = "ProseMirrorViewer";
