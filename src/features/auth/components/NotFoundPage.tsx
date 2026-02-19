import { UserLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button } from "@/shared/components";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export const NotFoundPage = () => {
	const navigate = useNavigate();
	const meta = useSeo({ rule: SEO_CONFIG.notFound });

	return (
		<UserLayout>
			{meta}
			<div className={styles.container}>
				<h1 className={styles.title}>404</h1>
				<p className={styles.message}>找不到頁面</p>
				<p className={styles.submessage}>你可能輸入了錯誤的網址，或該頁面已被移除。</p>
				<div className={styles.actions}>
					<Button icon={Home} onClick={() => navigate("/")}>
						返回首頁
					</Button>
				</div>
			</div>
		</UserLayout>
	);
};
