import type { CSSProperties, ReactNode } from "react";
import { ScrollContainer } from "../ScrollArea/ScrollContainer";
import styles from "./Table.module.css";

// ==================== Types ====================
export type ColumnWidthMode = "auto" | "fixed";
export type ColumnAlign = "left" | "center" | "right";
export type BorderStyle = "none" | "horizontal" | "full";
export type PaddingDensity = "compact" | "normal" | "loose";

export interface TableColumn<T = Record<string, unknown>> {
	/** 對應資料的欄位名稱 */
	key: keyof T;
	/** 表頭文字 */
	header: ReactNode;
	/** 自訂儲存格呈現（可選，預設用 toString()） */
	render?: (value: T[keyof T], record: T, index: number) => ReactNode;
	/** 寬度模式: auto = 自動撐滿，fixed = 固定寬度 */
	width?: ColumnWidthMode;
	/** 固定寬度（rem）- 如果 width="fixed" 必須提供 */
	fixedWidth?: string;
	/** 最小寬度（rem） */
	minWidth?: string;
	/** 文字對齊 */
	align?: ColumnAlign;
}

export interface TableProps<T = Record<string, unknown>> {
	/** 欄位定義陣列，未傳時自動從 data 的 key 產生 */
	columns?: TableColumn<T>[];
	/** 未傳 columns 時自動產生的欄位固定寬度（如 "8rem"） */
	defaultColumnWidth?: string;
	/** 資料陣列 */
	data: T[];
	/** 邊框樣式: "none" /"horizontal"/ "full" ，預設 "full" */
	borderStyle?: BorderStyle;
	/** 全表對齊，預設 "center" */
	align?: ColumnAlign;
	/** Padding : compact | normal | loose，預設 "normal" */
	density?: PaddingDensity;
	/** 是否 sticky header，預設 false */
	stickyHeader?: boolean;
	/** 是否顯示列編號，預設 false */
	showRowNumber?: boolean;
	/** 表格是否撐滿容器高度 */
	fillHeight?: boolean;
	/** 外層 div 的額外 CSS class */
	containerClassName?: string;
	/** <table> 的額外 CSS class */
	tableClassName?: string;
	/** 動態給列加 class */
	rowClassName?: (record: T, index: number) => string;
	/** 動態給儲存格加 class */
	cellClassName?: (value: T[keyof T], record: T, index: number, columnKey: keyof T) => string;
	/** 列被點擊時的回調 */
	onRowClick?: (record: T, index: number) => void;
	/** 空狀態時的提示文字 */
	emptyMessage?: string;
}

// ==================== Component ====================
export const Table = <T extends Record<string, unknown> = Record<string, unknown>>({
	columns: columnsProp,
	defaultColumnWidth,
	data,
	borderStyle = "full",
	align = "center",
	density = "normal",
	stickyHeader = false,
	showRowNumber = false,
	fillHeight = false,
	containerClassName,
	tableClassName,
	rowClassName,
	cellClassName,
	emptyMessage = "尚無資料"
}: TableProps<T>) => {
	const columns: TableColumn<T>[] =
		columnsProp ??
		(data.length > 0
			? Object.keys(data[0]).map(key => ({
					key: key as keyof T,
					header: key,
					...(defaultColumnWidth ? { width: "fixed" as const, fixedWidth: defaultColumnWidth } : {})
				}))
			: []);
	const totalCols = Math.max(1, columns.length + (showRowNumber ? 1 : 0));

	const containerClasses = [styles.container, fillHeight && styles.fillHeight, containerClassName].filter(Boolean).join(" ");

	const tableBorderClass = {
		none: styles.borderNone,
		horizontal: styles.borderHorizontal,
		full: styles.borderFull
	}[borderStyle];

	const tableClasses = [styles.table, tableBorderClass, stickyHeader && styles.stickyHeader, tableClassName].filter(Boolean).join(" ");

	const getDensityClass = (d: PaddingDensity): string => {
		const densityMap = {
			compact: styles.densityCompact,
			normal: styles.densityNormal,
			loose: styles.densityLoose
		};
		return densityMap[d];
	};

	return (
		<ScrollContainer className={containerClasses}>
			<table className={`${tableClasses} ${getDensityClass(density)}`} data-align={align}>
				<thead>
					<tr>
						{showRowNumber && <th className={`${styles.header} ${styles.rowNumberHeader}`}>#</th>}
						{columns.map(column => {
							const columnAlign = column.align || align;
							const columnStyle: CSSProperties = {};

							if (column.width === "fixed" && column.fixedWidth) {
								columnStyle.width = column.fixedWidth;
								columnStyle.minWidth = column.fixedWidth;
								columnStyle.maxWidth = column.fixedWidth;
							} else if (column.minWidth) {
								columnStyle.minWidth = column.minWidth;
							}

							return (
								<th key={String(column.key)} className={styles.header} data-align={columnAlign} style={columnStyle} title={typeof column.header === "string" ? column.header : undefined}>
									<div className={styles.headerContent}>{column.header}</div>
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{data.length === 0 ? (
						<tr>
							<td colSpan={totalCols} className={styles.empty}>
								{emptyMessage}
							</td>
						</tr>
					) : (
						data.map((record, rowIndex) => (
							<tr key={rowIndex} className={rowClassName?.(record, rowIndex) ?? ""}>
								{showRowNumber && <td className={`${styles.cell} ${styles.rowNumberCell}`}>{rowIndex + 1}</td>}
								{columns.map(column => {
									const value = record[column.key];
									const columnAlign = column.align || align;
									const columnStyle: CSSProperties = {};

									if (column.width === "fixed" && column.fixedWidth) {
										columnStyle.width = column.fixedWidth;
										columnStyle.minWidth = column.fixedWidth;
										columnStyle.maxWidth = column.fixedWidth;
									} else if (column.minWidth) {
										columnStyle.minWidth = column.minWidth;
									}

									return (
										<td
											key={`${rowIndex}-${String(column.key)}`}
											className={`${styles.cell} ${cellClassName?.(value, record, rowIndex, column.key) ?? ""}`}
											data-align={columnAlign}
											style={columnStyle}
											title={column.width === "fixed" && typeof value === "string" ? value : undefined}
										>
											{column.render ? column.render(value, record, rowIndex) : ((value as ReactNode) ?? "-")}
										</td>
									);
								})}
							</tr>
						))
					)}
				</tbody>
			</table>
		</ScrollContainer>
	);
};
