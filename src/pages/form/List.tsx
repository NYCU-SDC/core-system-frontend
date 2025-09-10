import DraftFormCard from "@/components/form/DraftFormCard.tsx";
import PublishedFormCard from "@/components/form/PublishedFormCard.tsx";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFormsQuery } from '@/lib/request/form.ts';
import { useEffect } from 'react';

const FormList: React.FC = () => {
	const navigate = useNavigate();
	const queryResult = useGetFormsQuery();
	const { data: forms, isLoading, error, refetch, isError, isSuccess, isFetching } = useGetFormsQuery();

	/*console.log('=== FormList API Debug ===');
	console.log('完整 query result:', queryResult);
	console.log('isLoading:', isLoading);
	console.log('isError:', isError);
	console.log('isSuccess:', isSuccess);
	console.log('isFetching:', isFetching);
	console.log('error:', error);
	console.log('data (forms):', forms);

	useEffect(() => {
		console.log('=== API 狀態變化 ===');
		console.log('isLoading:', isLoading);
		console.log('isError:', isError);
		console.log('isSuccess:', isSuccess);
		console.log('isFetching:', isFetching);
		console.log('error 詳情:', error);

		if (isError) {
			console.error('API 請求失敗:', error);
			// 檢查是否是網路錯誤、認證錯誤等
			if ('status' in error) {
				console.error('HTTP 狀態碼:', error.status);
				console.error('錯誤數據:', error.data);
			}
		}

		if (isSuccess) {
			console.log('API 請求成功，但數據是:', forms);
		}
	}, [isLoading, isError, isSuccess, isFetching, error, forms]);*/

	// 在組件載入時強制重新獲取一次數據
	useEffect(() => {
		console.log('FormList 組件載入，嘗試 refetch');
		refetch().then((result) => {
			console.log('refetch 結果:', result);
		}).catch((err) => {
			console.error('refetch 失敗:', err);
		});
	}, [refetch]);

	const handleNewForm = () => {
		console.log('Create new form');
		navigate('/forms/edit/new');
	};

	const handleEditForm = (id: string) => {
		console.log('Edit form:', id);
		navigate(`/forms/edit/${id}`);
	};

	const handleViewResult = (id: string) => {
		console.log('View result:', id);
		navigate(`/forms/results/${id}`);
	};

	const handlePublishForm = (id: string) => {
		console.log('Publish form:', id);
	};

	const safeFormsArray = forms || [];
	const draftForms = safeFormsArray.filter(form => {
		console.log('檢查表單:', form.id, 'status:', form.status);
		return form.status === 'draft';
	});
	const publishedForms = safeFormsArray.filter(form => form.status === 'published');

	/*console.log('篩選後的 draftForms:', draftForms);
	console.log('篩選後的 publishedForms:', publishedForms);*/

	if (isLoading || isFetching) {
		console.log('FormList 正在載入...');
		return (
			<div className="px-22 py-15">
				<h1 className="text-3xl font-bold text-gray-900 mb-4 pb-5">Forms</h1>
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<p className="text-gray-600">
							{isLoading ? 'Initial loading...' : 'Fetching data...'}
						</p>
						<button
							onClick={() => {
								console.log('手動取消並重新 fetch');
								refetch();
							}}
							className="mt-2 text-blue-500 underline"
						>
							Force Refresh
						</button>
					</div>
				</div>
			</div>
		);
	}

	// 顯示詳細的錯誤信息
	if (isError) {
		console.error('FormList 顯示錯誤狀態');
		return (
			<div className="px-22 py-15">
				<h1 className="text-3xl font-bold text-gray-900 mb-4 pb-5">Forms</h1>
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<p className="text-red-600 mb-4">Failed to load forms</p>
						<div className="text-sm text-gray-600 mb-4 text-left">
							<pre>{JSON.stringify(error, null, 2)}</pre>
						</div>
						<div className="flex gap-2 justify-center">
							<button
								onClick={() => {
									console.log('手動觸發 refetch');
									refetch();
								}}
								className="btn btn-primary"
							>
								Retry
							</button>
							<button
								onClick={() => {
									console.log('重新載入整個頁面');
									window.location.reload();
								}}
								className="btn btn-secondary"
							>
								Reload Page
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// 成功載入但沒有數據
	if (isSuccess && !forms) {
		console.warn('API 成功但數據是 null/undefined');
		return (
			<div className="px-22 py-15">
				<h1 className="text-3xl font-bold text-gray-900 mb-4 pb-5">Forms</h1>
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<p className="text-yellow-600 mb-4">API 成功但沒有返回數據</p>
						<button
							onClick={() => {
								console.log('手動觸發 refetch');
								refetch();
							}}
							className="btn btn-primary"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="px-22 py-15">
			<h1 className="text-4xl font-bold text-gray-900 mb-2 pb-5">Forms</h1>
			<div className="flex items-center mb-3">
				<h2 className="text-2xl font-semibold text-gray-900">Draft</h2>
				<button
					onClick={handleNewForm}
					className="btn btn-secondary ml-auto"
				>New</button>
			</div>

			<div className="flex flex-wrap gap-6 mb-8">
				{draftForms.length === 0 ? (
					<div className="w-full py-8 text-gray-500">
						No draft forms yet.
					</div>
				) : (
					draftForms.map((form) => {
						return (
							<div key={form.id} className="flex">
								<DraftFormCard
									form={form}
									onEdit={handleEditForm}
									onPublish={handlePublishForm}
								/>
							</div>
						);
					})
				)}
			</div>
			<h2 className="text-2xl font-semibold text-gray-900 mb-4">Published</h2>
			<div className="flex flex-wrap gap-6 mb-8">
				<div className="w-135">
					{publishedForms.length === 0 ? (
						<div className="w-full py-8 text-gray-500">
							No published forms yet.
						</div>
					) : (
						publishedForms.map((form) => (
							<div key={form.id} className="w-135">
								<PublishedFormCard
									form={form}
									onViewResult={handleViewResult}
								/>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default FormList;