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

const transformQuestionToAPI = (question: any) => {
	console.log('=== transformQuestionToAPI 輸入 ===');
	console.log('原始問題數據:', question);

	const title = question.title?.toString().trim();
	const type = question.type?.toString();
	const required = question.required;
	const order = question.order;

	console.log('字段檢查:');
	console.log('- title:', title, '(length:', title?.length || 0, ')');
	console.log('- type:', type);
	console.log('- required:', required, '(type:', typeof required, ')');
	console.log('- order:', order, '(type:', typeof order, ')');

	const finalTitle = title || `New ${type?.replace('_', ' ') || 'Question'}`;

	// 基本數據轉換，確保必填字段不為空
	const baseData = {
		Type: type,
		Title: finalTitle,
		Description: question.description?.toString() || '',
		Required: Boolean(required),
		Order: parseInt(order) || 0
	};

	console.log('基本數據:', baseData);


	// 根據問題類型添加特定屬性
	switch (question.type) {
		case 'short_text':
			return {
				...baseData,
				Placeholder: question.placeholder || '',
				MaxLength: question.maxLength || null
			};

		case 'long_text':
			return {
				...baseData,
				Placeholder: question.placeholder || '',
				MaxLength: question.maxLength || null,
				Rows: question.rows || 3
			};

		case 'single_choice':
			return {
				...baseData,
				Options: question.options || [],
				AllowOther: Boolean(question.allowOther)
			};

		case 'multiple_choice':
			return {
				...baseData,
				Options: question.options || [],
				AllowOther: Boolean(question.allowOther),
				MinSelections: question.minSelections || null,
				MaxSelections: question.maxSelections || null
			};

		case 'date':
			return {
				...baseData,
				DateFormat: question.dateFormat || 'YYYY-MM-DD',
				MinDate: question.minDate || null,
				MaxDate: question.maxDate || null
			};

		default:
			return baseData;
	}
};

const transformQuestionFromAPI = (question: any) => {
	const baseQuestion = {
		id: question.ID || question.id,
		type: question.Type || question.type,
		title: question.Title || question.title,
		description: question.Description || question.description,
		required: question.Required || question.required,
		order: question.Order || question.order
	};

	// 根據問題類型添加特定屬性
	switch (baseQuestion.type) {
		case 'short_text':
			return {
				...baseQuestion,
				placeholder: question.Placeholder || question.placeholder || '',
				maxLength: question.MaxLength || question.maxLength || null
			};

		case 'long_text':
			return {
				...baseQuestion,
				placeholder: question.Placeholder || question.placeholder || '',
				maxLength: question.MaxLength || question.maxLength || null,
				rows: question.Rows || question.rows || 3
			};

		case 'single_choice':
			return {
				...baseQuestion,
				options: question.Options || question.options || [],
				allowOther: question.AllowOther || question.allowOther || false
			};

		case 'multiple_choice':
			return {
				...baseQuestion,
				options: question.Options || question.options || [],
				allowOther: question.AllowOther || question.allowOther || false,
				minSelections: question.MinSelections || question.minSelections || null,
				maxSelections: question.MaxSelections || question.maxSelections || null
			};

		case 'date':
			return {
				...baseQuestion,
				dateFormat: question.DateFormat || question.dateFormat || 'YYYY-MM-DD',
				minDate: question.MinDate || question.minDate || null,
				maxDate: question.MaxDate || question.maxDate || null
			};

		default:
			return baseQuestion;
	}
};

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

				// 將 API 回應的字段名稱轉換為前端期望的格式
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
			providesTags: (_result, _error, id)=> [{ type: "Form", id }],
			transformResponse: (response: any) => {
				console.log('getForm API 原始回應:', response);
				const transformedResponse = transformFormData(response);
				console.log('getForm 轉換後的回應:', transformedResponse);
				return transformedResponse;
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
			invalidatesTags: (_result, _error, { id }
			) => [{ type: "Form", id }, "Form"],
			transformResponse: (response: any) => {
				console.log('updateForm API 原始回應:', response);
				const transformedResponse = transformFormData(response);
				console.log('updateForm 轉換後的回應:', transformedResponse);
				return transformedResponse;
			}
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
			invalidatesTags: ["Form"],
			transformResponse: (response: any) => {
				console.log('createForm API 原始回應:', response);
				const transformedResponse = transformFormData(response);
				console.log('createForm 轉換後的回應:', transformedResponse);
				return transformedResponse;
			}
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
			],
			transformResponse: (response: any[]) => {
				console.log('getQuestions API 原始回應:', response);
				const transformedResponse = response.map(transformQuestionFromAPI);
				console.log('getQuestions 轉換後的回應:', transformedResponse);
				return transformedResponse;
			}
		}),

		/**
		 * 建立新問題
		 */
		createQuestion: builder.mutation<BaseQuestion, { formId: UUID; data: QuestionRequest }>({
			query: ({ formId, data }) => {
				console.log('createQuestion 原始數據:', data);
				const transformedData = transformQuestionToAPI(data);
				console.log('createQuestion 轉換後數據:', transformedData);

				return {
					url: `/forms/${formId}/questions`,
					method: "POST",
					body: data
				};
			},
			//invalidatesTags: [{ type: "Question", id: "LIST" }]
		}),

		/**
		 * 更新問題
		 */
		updateQuestion: builder.mutation<
			BaseQuestion,
			{ formId: UUID; questionId: UUID; data: QuestionRequest }
		>({
			query: ({ formId, questionId, data }) => {
				console.log('updateQuestion 原始數據:', data);
				const transformedData = transformQuestionToAPI(data);
				console.log('updateQuestion 轉換後數據:', transformedData);

				return {
					url: `/forms/${formId}/questions/${questionId}`,
					method: "PUT",
					body: data
				};
			},
			invalidatesTags: (_result, _error, { questionId }) => [
				{ type: "Question", id: questionId },
				{ type: "Question", id: "LIST" }
			],
			transformResponse: (response: any) => {
				console.log('updateQuestion API 回應:', response);
				const transformedResponse = transformQuestionFromAPI(response);
				console.log('updateQuestion 轉換後回應:', transformedResponse);
				return transformedResponse;
			}
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