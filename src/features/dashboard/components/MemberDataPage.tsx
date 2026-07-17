import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useFormResponsesWithDetails } from "@/features/form/hooks/useFormResponses";
import { useFormById, useOrgForms } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import { useCreateView, useDeleteView, useDuplicateView, useLockView, useUnlockView, useUpdateView, useViews } from "@/features/form/hooks/useViews";
import { useWorkflow } from "@/features/form/hooks/useWorkflow";
import type { ViewsViewResponse } from "@/features/form/services/api";
import { AdminLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { ErrorMessage, LoadingSpinner, Table, useToast } from "@/shared/components";
import { formKeys } from "@/shared/queryKeys/org";
import type { FormsSectionBundle } from "@nycu-sdc/core-system-sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ColumnRow } from "./ColumnRow/ColumnRow";
import styles from "./MemberDataPage.module.css";
import { ViewTabDropdown } from "./ViewTabDropdown/ViewTabDropdown";

// Render key-question answers as chips; comma-separated values become multiple chips
const renderKeyAnswer = (value: unknown) => {
	const text = typeof value === "string" ? value.trim() : value == null ? "" : String(value);
	if (!text || text === "-") return "-";
	return (
		<span className={styles.badgeCell}>
			{text
				.split(/,\s*/)
				.filter(Boolean)
				.map((label, i) => (
					<span key={i} className={styles.cellChip}>
						{label}
					</span>
				))}
		</span>
	);
};

export const MemberDataPage = () => {
	const orgSlug = useActiveOrgSlug();
	const { formid: routeFormId } = useParams<{ formid?: string }>();
	const navigate = useNavigate();
	const meta = useSeo({ rule: SEO_CONFIG.memberDataPage });
	const [searchParams, setSearchParams] = useSearchParams();

	const { pushToast } = useToast();
	const queryClient = useQueryClient();
	const orgFormsQuery = useOrgForms(orgSlug);
	const formId = routeFormId ?? orgFormsQuery.data?.[0]?.id;
	const mutationFormId = formId ?? "";
	const viewsQuery = useViews(formId);
	const views = useMemo(() => [...(viewsQuery.data ?? [])].sort((a, b) => a.order - b.order), [viewsQuery.data]);

	// URL is the single source of truth for the selected view: ?view=<id>
	const viewParam = searchParams.get("view");
	const activeView = useMemo(() => views.find(v => v.id === viewParam) ?? views[0] ?? null, [views, viewParam]);

	const selectViewInUrl = (viewId: string, options?: { replace?: boolean }) =>
		setSearchParams(
			prev => {
				const next = new URLSearchParams(prev);
				next.set("view", viewId);
				return next;
			},
			{ replace: options?.replace }
		);

	// Backfill ?view= to the first tab when missing/invalid; replace to avoid a history entry
	useEffect(() => {
		if (views.length === 0) return;
		if (!viewParam || !views.some(v => v.id === viewParam)) selectViewInUrl(views[0].id, { replace: true });
	}, [views, viewParam]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!routeFormId && formId) navigate(`/orgs/${orgSlug}/forms/${formId}/members`, { replace: true });
	}, [formId, navigate, orgSlug, routeFormId]);

	const createView = useCreateView(mutationFormId);
	const duplicateView = useDuplicateView(mutationFormId);
	const updateView = useUpdateView(mutationFormId);
	const lockView = useLockView(mutationFormId);
	const unlockView = useUnlockView(mutationFormId);
	const deleteView = useDeleteView(mutationFormId);

	const formQuery = useFormById(formId);
	const formTitle = formQuery.data?.title ?? "成員資料";

	const sectionsQuery = useSections(formId);
	const { data: responseDetails = [] } = useFormResponsesWithDetails(formId);

	const sectionsData = useMemo<FormsSectionBundle[]>(() => sectionsQuery.data ?? [], [sectionsQuery.data]);
	const allQuestions = useMemo(() => sectionsData.flatMap(bundle => bundle.questions ?? []), [sectionsData]);

	// Workflow key questions = those referenced by CONDITION nodes; rendered as chips
	const workflowQuery = useWorkflow(formId);
	const keyQuestionIds = useMemo(() => {
		const nodes = workflowQuery.data?.workflow ?? [];
		return new Set(
			nodes
				.filter(node => node.type === "CONDITION")
				.map(node => node.conditionRule?.question)
				.filter((id): id is string => !!id)
		);
	}, [workflowQuery.data]);

	const [hiddenQuestionIds, setHiddenQuestionIds] = useState<Set<string>>(new Set());
	const [isColumnCollapsed, setIsColumnCollapsed] = useState(false);
	const [isColumnExiting, setIsColumnExiting] = useState(false);
	const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tableWrapperRef = useRef<HTMLDivElement>(null);

	useEffect(
		() => () => {
			if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
		},
		[]
	);

	// Measure sticky header height into a CSS var so scroll-padding-top adapts to density/font
	useEffect(() => {
		const wrapper = tableWrapperRef.current;
		const thead = wrapper?.querySelector("thead");
		if (!wrapper || !thead) return;
		const updateHeaderHeight = () => wrapper.style.setProperty("--view-table-header-height", `${thead.getBoundingClientRect().height}px`);
		updateHeaderHeight();
		const observer = new ResizeObserver(updateHeaderHeight);
		observer.observe(thead);
		return () => observer.disconnect();
	}, []);

	const handleColumnToggle = () => {
		if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
		if (!isColumnCollapsed) {
			setIsColumnExiting(true);
			collapseTimerRef.current = setTimeout(() => {
				setIsColumnCollapsed(true);
				setIsColumnExiting(false);
			}, 150);
		} else {
			setIsColumnExiting(false);
			setIsColumnCollapsed(false);
		}
	};

	const visibleQuestions = useMemo(() => allQuestions.filter(q => !hiddenQuestionIds.has(q.id)), [allQuestions, hiddenQuestionIds]);

	// Columns clamp long answers to 10–20rem with ellipsis; key questions render as chips
	const tableColumns = useMemo(
		() =>
			visibleQuestions.map(q => {
				const base = { key: q.id, header: q.title, minWidth: "10rem", maxWidth: "20rem" };
				return keyQuestionIds.has(q.id) ? { ...base, render: renderKeyAnswer } : { ...base, ellipsis: true };
			}),
		[visibleQuestions, keyQuestionIds]
	);

	const tableData = useMemo(
		() =>
			responseDetails.map(response => {
				const answerMap = new Map<string, string>();
				response.sections.forEach(section => {
					section.answerDetails.forEach(detail => {
						answerMap.set(detail.question.id, detail.payload?.displayValue ?? "-");
					});
				});
				return Object.fromEntries(visibleQuestions.map(q => [q.id, answerMap.get(q.id) ?? "-"]));
			}),
		[responseDetails, visibleQuestions]
	);

	const handleToggleQuestion = (questionId: string) => {
		setHiddenQuestionIds(prev => {
			const next = new Set(prev);
			if (next.has(questionId)) next.delete(questionId);
			else next.add(questionId);
			return next;
		});
	};

	const handleToggleSection = (questionIds: string[], allVisible: boolean) => {
		setHiddenQuestionIds(prev => {
			const next = new Set(prev);
			if (allVisible) questionIds.forEach(id => next.add(id));
			else questionIds.forEach(id => next.delete(id));
			return next;
		});
	};

	// ErrorToast
	const withErrorToast = <T,>(errorTitle: string, run: () => Promise<T>): Promise<T> =>
		run().catch((error: unknown) => {
			pushToast({ title: errorTitle, description: error instanceof Error ? error.message : String(error), variant: "error" });
			throw error;
		});

	const handleCreateView = (): Promise<ViewsViewResponse> => withErrorToast("新增分頁失敗", () => createView.mutateAsync());

	const handleDuplicateView = (viewId: string): Promise<ViewsViewResponse> => withErrorToast("建立副本失敗", () => duplicateView.mutateAsync(viewId));

	const handleRenameView = (viewId: string, title: string): Promise<ViewsViewResponse> => withErrorToast("重新命名失敗", () => updateView.mutateAsync({ viewId, req: { title } }));

	const handleLockView = (viewId: string): Promise<ViewsViewResponse> => withErrorToast("鎖定分頁失敗", () => lockView.mutateAsync(viewId));

	const handleUnlockView = (viewId: string): Promise<ViewsViewResponse> => withErrorToast("解鎖分頁失敗", () => unlockView.mutateAsync(viewId));

	const handleDeleteView = (viewId: string): Promise<void> => withErrorToast("刪除分頁失敗", () => deleteView.mutateAsync(viewId));

	const handleReorderViews = (newViews: ViewsViewResponse[]) => {
		const reordered = newViews.map((view, index) => ({ ...view, order: index }));
		queryClient.setQueryData(formKeys.views(mutationFormId), reordered);
		const changedViews = reordered.filter(view => views.find(previous => previous.id === view.id)?.order !== view.order);
		if (changedViews.length === 0) return;

		void Promise.allSettled(changedViews.map(view => updateView.mutateAsync({ viewId: view.id, req: { order: view.order }, invalidate: false }))).then(results => {
			void queryClient.invalidateQueries({ queryKey: formKeys.views(mutationFormId) });
			const failedCount = results.filter(result => result.status === "rejected").length;
			if (failedCount > 0) {
				pushToast({ title: "排序更新失敗", description: `${failedCount} 個分頁未能更新，已重新載入伺服器順序。`, variant: "error" });
			}
		});
	};

	if (!formId) {
		return (
			<AdminLayout fixedHeight>
				{meta}
				<section className={styles.page} aria-label={`${orgSlug} member data`}>
					{orgFormsQuery.isLoading ? (
						<LoadingSpinner />
					) : orgFormsQuery.isError ? (
						<ErrorMessage message={(orgFormsQuery.error as Error).message} />
					) : (
						<ErrorMessage message="目前沒有可顯示成員資料的表單。" />
					)}
				</section>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout fixedHeight>
			{meta}
			<section className={styles.page} aria-label={`${orgSlug} member data`}>
				<h1 className={styles.title}>{formTitle}</h1>
				<div className={styles.panel}>
					<div className={styles.controls}>
						<div className={styles.tabRow}>
							<ViewTabDropdown
								views={views}
								activeViewId={activeView?.id ?? null}
								onSelect={view => selectViewInUrl(view.id)}
								onCreateView={handleCreateView}
								onDuplicateView={handleDuplicateView}
								onRenameView={handleRenameView}
								onLockView={handleLockView}
								onUnlockView={handleUnlockView}
								onDeleteView={handleDeleteView}
								onReorderViews={handleReorderViews}
							/>
						</div>

						<ColumnRow
							sectionsData={sectionsData}
							hiddenQuestionIds={hiddenQuestionIds}
							onToggleQuestion={handleToggleQuestion}
							onToggleSection={handleToggleSection}
							isCollapsed={isColumnCollapsed}
							isExiting={isColumnExiting}
							onToggleCollapse={handleColumnToggle}
						/>
					</div>

					<div className={styles.contentCard}>
						<div ref={tableWrapperRef} className={styles.tableWrapper}>
							<Table className={styles.ViewTable} data={tableData} columns={tableColumns} borderStyle="horizontal" stickyHeader showRowNumber />
						</div>
					</div>
				</div>
			</section>
		</AdminLayout>
	);
};
