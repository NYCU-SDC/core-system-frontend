import { Tooltip } from "@/shared/components";
import { ChevronDown, Copy, GripVertical, Lock, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./ViewTabDropdown.module.css";

export interface View {
	id: string;
	title: string;
	locked: boolean;
	order: number;
}

interface ViewTabDropdownProps {
	onSelect: (view: View) => void;
}

const MOCK_VIEWS: View[] = [
	{ id: "1", title: "Core System", locked: false, order: 0 },
	{ id: "2", title: "Clustron", locked: false, order: 1 },
	{ id: "3", title: "Admin", locked: true, order: 2 },
	{ id: "4", title: "ITSC-HR", locked: true, order: 3 },
	{ id: "5", title: "SCIEDU", locked: false, order: 4 }
];

export const ViewTabDropdown = ({ onSelect }: ViewTabDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeId, setActiveId] = useState(MOCK_VIEWS[0].id);
	const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

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
				<span>分頁</span>
				<ChevronDown size={18} className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`} />
			</button>

			{isOpen && (
				<div className={styles.dropdown}>
					{MOCK_VIEWS.map(tab => (
						<div
							key={tab.id}
							className={`${styles.item}${tab.locked ? ` ${styles.itemLocked}` : ""}${tab.id === activeId ? ` ${styles.itemActive}` : ""}`}
							onClick={() => {
								setActiveId(tab.id);
								setOpenSubmenuId(null);
								onSelect(tab);
							}}
						>
							<span className={styles.handle}>
								<Tooltip content="拖曳以移動" side="bottom" delayDuration={500}>
									<GripVertical width={12} height={20} />
								</Tooltip>
							</span>

							<span className={styles.itemTitle}>{tab.title}</span>

							{tab.locked ? (
								<span className={styles.lockIcon}>
									<Lock size={16} />
								</span>
							) : (
								<div className={styles.moreWrapper}>
									<button
										type="button"
										className={styles.moreButton}
										onClick={e => {
											e.stopPropagation();
											setOpenSubmenuId(prev => (prev === tab.id ? null : tab.id));
										}}
									>
										<MoreVertical size={16} />
									</button>
								</div>
							)}

							{openSubmenuId === tab.id && (
								<div className={styles.submenu}>
									<button
										type="button"
										className={styles.submenuItem}
										onClick={() => {
											console.log("rename", tab.id);
											setOpenSubmenuId(null);
										}}
									>
										<span>重新命名</span>
										<div className={styles.submenuItemIcon}>
											<Pencil size={14} />
										</div>
									</button>
									<button
										type="button"
										className={styles.submenuItem}
										onClick={() => {
											console.log("duplicate", tab.id);
											setOpenSubmenuId(null);
										}}
									>
										<span>建立副本</span>
										<div className={styles.submenuItemIcon}>
											<Copy size={14} />
										</div>
									</button>
									<button
										type="button"
										className={styles.submenuItem}
										onClick={() => {
											console.log("lock", tab.id);
											setOpenSubmenuId(null);
										}}
									>
										<span>鎖定</span>
										<div className={styles.submenuItemIcon}>
											<Lock size={14} />
										</div>
									</button>
									<button
										type="button"
										className={`${styles.submenuItem} ${styles.submenuItemDanger}`}
										onClick={() => {
											console.log("delete", tab.id);
											setOpenSubmenuId(null);
										}}
									>
										<span>刪除</span>
										<div className={styles.submenuItemIcon}>
											<Trash2 size={14} />
										</div>
									</button>
								</div>
							)}
						</div>
					))}

					<button type="button" className={`${styles.item} ${styles.addItem}`}>
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
