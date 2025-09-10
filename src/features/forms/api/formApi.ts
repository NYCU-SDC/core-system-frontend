import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/app/api';
import type {
	FormData,
	FormRequest,
	BaseQuestion,
	QuestionRequest,
	SubmitRequest,
	SubmitResponse,
	ListResponse,
	GetResponse,
	AnswersForQuestionResponse,
	RecipientSelectionRequest,
	RecipientSelectionResponse,
	UUID
} from '@/types/form.ts';

const transformFormData = (form: any): FormData => ({
	id: form.ID,
	title: form.Title,
	description: form.Description,
	unitId: Array.isArray(form.UnitID)
		? form.UnitID
		: form.UnitID
			? [form.UnitID]
			: [],
	status: form.Status?.toLowerCase() || 'draft',
	lastEditor: form.LastEditor,
	createdAt: form.CreatedAt,
	updatedAt: form.UpdatedAt
});

export const formsApi = createApi({
	reducerPath: "formsApi",
	baseQuery,
	tagTypes: ["Form", "Question", "Response"],
	endpoints: builder => ({
		// ========== 表單管理 ==========

		/**
		 * 取得所有表單列表
		 */
		getForms: builder.query<FormData[], void>({
			query: () => "/forms",
			providesTags: ["Form"],
			transformResponse: (response: any[]) => {
				console.log('API 原始回應:', response);
				const transformedResponse = response.map(transformFormData);
				console.log('轉換後的回應:', transformedResponse);
				return transformedResponse;
			}
		}),

		/**
		 * 取得特定表單詳情
		 */
		getForm: builder.query<FormData, UUID>({
			query: id => `/forms/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Form", id }],
			transformResponse: (response: any) => {
				console.log('API 原始回傳:', response);
				return response.data;
			}
		}),

		/**
		 * 更新表單
		 */
		updateForm: builder.mutation<FormData, { id: UUID; data: FormRequest }>({
			query: ({ id, data }) => ({
				url: `/forms/${id}`,
				method: "PUT",
				body: data
			}),
			invalidatesTags: (_result, _error, { id }) => [{ type: "Form", id }, "Form"]
		}),

		/**
		 * 刪除表單
		 */
		deleteForm: builder.mutation<void, UUID>({
			query: id => ({
				url: `/forms/${id}`,
				method: "DELETE"
			}),
			invalidatesTags: ["Form"]
		}),

		/**
		 * 發布表單
		 */
		publishForm: builder.mutation<void, { id: UUID; recipients: RecipientSelectionRequest }>({
			query: ({ id, recipients }) => ({
				url: `/forms/${id}/publish`,
				method: "POST",
				body: recipients
			}),
			invalidatesTags: (_result, _error, { id }) => [{ type: "Form", id }, "Form"]
		}),

		/**
		 * 在特定單位下建立新表單
		 */
		createForm: builder.mutation<
			FormData,
			{ orgSlug: string; unitId: UUID; data: FormRequest }
		>({
			query: ({ orgSlug, unitId, data }) => ({
				url: `/orgs/${orgSlug}/units/${unitId}/forms`,
				method: "POST",
				body: data
			}),
			invalidatesTags: ["Form"]
		}),

		/**
		 * 預覽收件人列表
		 */
		previewRecipients: builder.mutation<RecipientSelectionResponse, RecipientSelectionRequest>({
			query: data => ({
				url: "/forms/recipients/preview",
				method: "POST",
				body: data
			})
		}),

		// ========== 問題管理 ==========

		/**
		 * 取得表單的所有問題
		 */
		getQuestions: builder.query<BaseQuestion[], UUID>({
			query: formId => `/forms/${formId}/questions`,
			providesTags: (result) => [
				{ type: "Question", id: "LIST" },
				...(result?.map(({ id }) => ({ type: "Question" as const, id })) || [])
			]
		}),

		/**
		 * 建立新問題
		 */
		createQuestion: builder.mutation<BaseQuestion, { formId: UUID; data: QuestionRequest }>({
			query: ({ formId, data }) => ({
				url: `/forms/${formId}/questions`,
				method: "POST",
				body: data
			}),
			invalidatesTags: [{ type: "Question", id: "LIST" }]
		}),

		/**
		 * 更新問題
		 */
		updateQuestion: builder.mutation<
			BaseQuestion,
			{ formId: UUID; questionId: UUID; data: QuestionRequest }
		>({
			query: ({ formId, questionId, data }) => ({
				url: `/forms/${formId}/questions/${questionId}`,
				method: "PUT",
				body: data
			}),
			invalidatesTags: (_result, _error, { questionId }) => [
				{ type: "Question", id: questionId },
				{ type: "Question", id: "LIST" }
			]
		}),

		/**
		 * 刪除問題
		 */
		deleteQuestion: builder.mutation<void, { formId: UUID; questionId: UUID }>({
			query: ({ formId, questionId }) => ({
				url: `/forms/${formId}/questions/${questionId}`,
				method: "DELETE"
			}),
			invalidatesTags: [{ type: "Question", id: "LIST" }]
		}),

		// ========== 回應管理 ==========

		/**
		 * 提交表單回應
		 */
		submitResponse: builder.mutation<SubmitResponse, { formId: UUID; data: SubmitRequest }>({
			query: ({ formId, data }) => ({
				url: `/forms/${formId}/responses`,
				method: "POST",
				body: data
			}),
			invalidatesTags: (_result, _error, { formId }) => [
				{ type: "Response", id: "LIST" },
				{ type: "Form", id: formId }
			]
		}),

		/**
		 * 取得表單所有回應
		 */
		getFormResponses: builder.query<ListResponse, UUID>({
			query: formId => `/forms/${formId}/responses`,
			providesTags: (result) => [
				{ type: "Response", id: "LIST" },
				...(result?.responses?.map(({ id }) => ({ type: "Response" as const, id })) || [])
			]
		}),

		/**
		 * 取得特定回應詳情
		 */
		getResponse: builder.query<GetResponse, { formId: UUID; responseId: UUID }>({
			query: ({ formId, responseId }) => `/forms/${formId}/responses/${responseId}`,
			providesTags: (_result, _error, { responseId }) => [{ type: "Response", id: responseId }]
		}),

		/**
		 * 刪除回應
		 */
		deleteResponse: builder.mutation<void, { formId: UUID; responseId: UUID }>({
			query: ({ formId, responseId }) => ({
				url: `/forms/${formId}/responses/${responseId}`,
				method: "DELETE"
			}),
			invalidatesTags: [{ type: "Response", id: "LIST" }]
		}),

		/**
		 * 取得特定問題的所有答案
		 */
		getQuestionAnswers: builder.query<
			AnswersForQuestionResponse,
			{ formId: UUID; questionId: UUID }
		>({
			query: ({ formId, questionId }) => `/forms/${formId}/questions/${questionId}`,
			providesTags: (_result, _error, { questionId }) => [{ type: "Question", id: questionId }]
		})
	})
});

export const {
	useGetFormsQuery,
	useGetFormQuery,
	useUpdateFormMutation,
	useDeleteFormMutation,
	usePublishFormMutation,
	useCreateFormMutation,
	usePreviewRecipientsMutation,

	useGetQuestionsQuery,
	useCreateQuestionMutation,
	useUpdateQuestionMutation,
	useDeleteQuestionMutation,

	useSubmitResponseMutation,
	useGetFormResponsesQuery,
	useGetResponseQuery,
	useDeleteResponseMutation,
	useGetQuestionAnswersQuery,
} = formsApi;