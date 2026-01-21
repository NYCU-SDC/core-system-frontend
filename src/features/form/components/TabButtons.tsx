import styles from "./TabButtons.module.css";

export interface Tab {
	value: string;
	label: string;
}

export interface TabButtonsProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (value: string) => void;
}

export const TabButtons = ({ tabs, activeTab, onTabChange }: TabButtonsProps) => {
	return (
		<div className={styles.btnList}>
			{tabs.map(tab => (
				<button key={tab.value} className={`${styles.btn} ${activeTab === tab.value ? styles.btnActive : ""}`} onClick={() => onTabChange(tab.value)}>
					{tab.label}
				</button>
			))}
		</div>
	);
};
