import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { AdminLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Table } from "@/shared/components";
import { Hash } from "lucide-react";
import { useState } from "react";
import styles from "./MemberDataPage.module.css";
import { type View, ViewTabDropdown } from "./ViewTabDropdown/ViewTabDropdown";

export const MemberDataPage = () => {
	const orgSlug = useActiveOrgSlug();
	const meta = useSeo({ rule: SEO_CONFIG.memberDataPage });
	const [selectedView, setSelectedView] = useState<View | null>(null);

	return (
		<AdminLayout fixedHeight>
			{meta}
			<section className={styles.page} aria-label={`${orgSlug} member data`}>
				<h1 className={styles.title}>formTitle</h1>
				<div className={styles.panel}>
					<div className={styles.controls}>
						<div className={styles.tabRow}>
							<ViewTabDropdown onSelect={setSelectedView} />
							{selectedView && <span className={styles.activeViewLabel}>{selectedView.title}</span>}
						</div>

						<div className={styles.chip}>
							<span>Column</span>
							<Hash size={16} className={styles.chipIcon} />
						</div>
					</div>

					<div className={styles.contentCard}>
						<div className={styles.tableWrapper}>
							<Table data={[]} borderStyle="full" />
						</div>
					</div>
				</div>
			</section>
		</AdminLayout>
	);
};
