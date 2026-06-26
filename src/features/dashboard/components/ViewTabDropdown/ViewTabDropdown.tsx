import type { ViewsViewResponse } from "@/features/form/services/api";
import { Button, Dialog, Tooltip } from "@/shared/components";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Copy, GripVertical, Lock, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ViewTabDropdown.module.css";

interface ViewTabDropdownProps {
	views: ViewsViewResponse[];
	activeViewId: string | null;
	onSelect: (view: ViewsViewResponse) => void;
	onCreateView: () => Promise<ViewsViewResponse>;
	onDuplicateView: (viewId: string) => Promise<ViewsViewResponse>;
	onRenameView: (viewId: string, title: string) => Promise<ViewsViewResponse>;
	onLockView: (viewId: string) => Promise<ViewsViewResponse>;
	onUnlockView: (viewId: string) => Promise<ViewsViewResponse>;
	onDeleteView: (viewId: string) => Promise<void>;
	onReorderViews: (newViews: ViewsViewResponse[]) => void;
}

function SortableViewItem({ id, children }: { id: string; children: (listeners: React.HTMLAttributes<HTMLElement> | undefined) => ReactNode }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
	return (
		<div ref={setNodeRef} className={styles.sortableWrapper} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }} {...attributes}>
			{children(listeners as React.HTMLAttributes<HTMLElement> | undefined)}
		</div>
	);
}

export const ViewTabDropdown = ({ views, activeViewId, onSelect, onCreateView, onDuplicateView, onRenameView, onLockView, onUnlockView, onDeleteView, onReorderViews }: ViewTabDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
	const [editingViewId, setEditingViewId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState("");
	const [duplicateError, setDuplicateError] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<ViewsViewResponse | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isTouchDevice = useMemo(() => window.matchMedia("(hover: none)").matches, []);
	const sensors = useSensors(useSensor(PointerSensor));

	const clearShowTimer = () => {
		if (showTimerRef.current) {
			clearTimeout(showTimerRef.current);
			showTimerRef.current = null;
		}
	};
	const clearHideTimer = () => {
		if (hideTimerRef.current) {
			clearTimeout(hideTimerRef.current);
			hideTimerRef.current = null;
		}
	};

	useEffect(() => {
		if (editingViewId) {
			inputRef.current?.focus();
			inputRef.current?.select();
		}
	}, [editingViewId]);

	useEffect(() => {
		if (!isOpen) {
			clearShowTimer();
			clearHideTimer();
		}
	}, [isOpen]);

	useEffect(
		() => () => {
			clearShowTimer();
			clearHideTimer();
		},
		[]
	);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
				setOpenSubmenuId(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleDragEnd = (event: DragEndEvent) => {
		setIsDragging(false);
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const oldIndex = views.findIndex(v => v.id === active.id);
			const newIndex = views.findIndex(v => v.id === over.id);
			onReorderViews(arrayMove(views, oldIndex, newIndex));
		}
	};

	const handleSelectView = (tab: ViewsViewResponse) => {
		setOpenSubmenuId(null);
		onSelect(tab);
	};

	const handleConfirmDelete = () => {
		if (!deleteTarget) return;
		setIsDeleting(true);
		onDeleteView(deleteTarget.id)
			.then(() => setDeleteTarget(null))
			.catch(() => {})
			.finally(() => setIsDeleting(false));
	};

	const handleCreateView = async () => {
		try {
			const newView = await onCreateView();
			setEditingViewId(newView.id);
			setEditingTitle(newView.title);
		} catch (e) {
			console.error("createView failed", e);
		}
	};

	const handleConfirmRename = async () => {
		if (!editingViewId) return;
		const trimmed = editingTitle.trim();
		if (!trimmed) {
			setEditingViewId(null);
			return;
		}
		const isDuplicate = views.some(v => v.id !== editingViewId && v.title === trimmed);
		if (isDuplicate) {
			setDuplicateError(true);
			inputRef.current?.focus();
			return;
		}
		setDuplicateError(false);
		await onRenameView(editingViewId, trimmed).catch(() => {});
		setEditingViewId(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleConfirmRename();
		if (e.key === "Escape") {
			setEditingViewId(null);
			setDuplicateError(false);
		}
	};

	const handleMoreMouseEnter = (tabId: string) => {
		clearHideTimer();
		clearShowTimer();
		showTimerRef.current = setTimeout(() => setOpenSubmenuId(tabId), 100);
	};
	const handleMoreMouseLeave = () => {
		clearShowTimer();
		hideTimerRef.current = setTimeout(() => setOpenSubmenuId(null), 200);
	};
	const handleSubmenuMouseEnter = () => {
		clearHideTimer();
	};
	const handleSubmenuMouseLeave = () => {
		hideTimerRef.current = setTimeout(() => setOpenSubmenuId(null), 200);
	};

	return (
		<div ref={containerRef} className={styles.container}>
			<button
				type="button"
				className={styles.trigger}
				onClick={() => {
					setIsOpen(prev => !prev);
					setOpenSubmenuId(null);
				}}
			>
				<span>{views.find(v => v.id === activeViewId)?.title ?? "分頁"}</span>
				<ChevronDown size={18} className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`} />
			</button>

			<Dialog
				open={deleteTarget !== null}
				onOpenChange={open => {
					if (!open && !isDeleting) setDeleteTarget(null);
				}}
				title="確定刪除嗎？"
				description={deleteTarget ? `刪除分頁「${deleteTarget.title}」後將無法復原。` : ""}
				size="sm"
				footer={
					<>
						<Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
							取消
						</Button>
						<Button themeColor="var(--red)" onClick={handleConfirmDelete} processing={isDeleting}>
							刪除
						</Button>
					</>
				}
			>
				<span />
			</Dialog>

			{isOpen && (
				<div className={styles.dropdown}>
					<DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd} onDragCancel={() => setIsDragging(false)}>
						<SortableContext items={views.map(v => v.id)} strategy={verticalListSortingStrategy}>
							{views.map(tab => (
								<SortableViewItem key={tab.id} id={tab.id}>
									{dragListeners => (
										<div
											className={`${styles.item}${tab.locked ? ` ${styles.itemLocked}` : ""}${tab.id === activeViewId ? ` ${styles.itemActive}` : ""}`}
											onClick={() => editingViewId !== tab.id && handleSelectView(tab)}
										>
											<span className={styles.handle} {...dragListeners}>
												{isDragging ? (
													<GripVertical width={12} height={20} />
												) : (
													<Tooltip content="拖曳以移動" side="bottom" delayDuration={500}>
														<GripVertical width={12} height={20} />
													</Tooltip>
												)}
											</span>

											{editingViewId === tab.id ? (
												<input
													ref={inputRef}
													className={`${styles.itemTitleInput}${duplicateError ? ` ${styles.itemTitleInputError}` : ""}`}
													value={editingTitle}
													onChange={e => {
														setEditingTitle(e.target.value);
														setDuplicateError(false);
													}}
													onBlur={handleConfirmRename}
													onKeyDown={handleKeyDown}
													onClick={e => e.stopPropagation()}
												/>
											) : (
												<span className={styles.itemTitle}>{tab.title}</span>
											)}

											{tab.locked ? (
												<button
													type="button"
													className={styles.lockButton}
													onClick={e => {
														e.stopPropagation();
														onUnlockView(tab.id).catch(() => {});
													}}
													title="點擊解鎖"
												>
													<Lock size={16} />
												</button>
											) : (
												<div
													className={styles.moreWrapper}
													onMouseEnter={!isTouchDevice ? () => handleMoreMouseEnter(tab.id) : undefined}
													onMouseLeave={!isTouchDevice ? handleMoreMouseLeave : undefined}
												>
													<button
														type="button"
														className={styles.moreButton}
														onClick={
															isTouchDevice
																? e => {
																		e.stopPropagation();
																		clearShowTimer();
																		clearHideTimer();
																		setOpenSubmenuId(prev => (prev === tab.id ? null : tab.id));
																	}
																: undefined
														}
													>
														<MoreVertical size={16} />
													</button>
												</div>
											)}

											{openSubmenuId === tab.id && (
												<div className={styles.submenu} onMouseEnter={!isTouchDevice ? handleSubmenuMouseEnter : undefined} onMouseLeave={!isTouchDevice ? handleSubmenuMouseLeave : undefined}>
													<button
														type="button"
														className={styles.submenuItem}
														onClick={() => {
															setEditingViewId(tab.id);
															setEditingTitle(tab.title);
															setOpenSubmenuId(null);
														}}
													>
														<span>重新命名</span>
														<div className={styles.submenuItemIcon}>
															<Pencil size={16} />
														</div>
													</button>
													<button
														type="button"
														className={styles.submenuItem}
														onClick={() => {
															onDuplicateView(tab.id).catch(() => {});
															setOpenSubmenuId(null);
														}}
													>
														<span>建立副本</span>
														<div className={styles.submenuItemIcon}>
															<Copy size={16} />
														</div>
													</button>
													<button
														type="button"
														className={styles.submenuItem}
														onClick={() => {
															onLockView(tab.id).catch(() => {});
															setOpenSubmenuId(null);
														}}
													>
														<span>鎖定</span>
														<div className={styles.submenuItemIcon}>
															<Lock size={16} />
														</div>
													</button>
													<button
														type="button"
														className={`${styles.submenuItem} ${styles.submenuItemDanger}`}
														onClick={() => {
															setDeleteTarget(tab);
															setOpenSubmenuId(null);
														}}
													>
														<span>刪除</span>
														<div className={styles.submenuItemIcon}>
															<Trash2 size={16} />
														</div>
													</button>
												</div>
											)}
										</div>
									)}
								</SortableViewItem>
							))}
						</SortableContext>
					</DndContext>

					<button type="button" className={`${styles.item} ${styles.addItem}`} onClick={handleCreateView}>
						<span>新增分頁</span>
						<span className={styles.plusIcon}>
							<Plus size={16} />
						</span>
					</button>
				</div>
			)}
		</div>
	);
};
