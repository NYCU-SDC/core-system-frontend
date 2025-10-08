import type { FormData } from "@/types/form.ts";
import { GroupSelector } from "./GroupSelector";

interface FormSettingsProps {
	formData: FormData | null;
	isNewForm: boolean;
	selectedPublishUnits: string[];
	availableGroups: string[] | undefined;
	onFormDataChange: (updates: Partial<FormData>) => void;
	onPublishUnitsChange: (selectedGroupNames: string[]) => void;
}

export const FormSettings = ({
	formData,
	isNewForm,
	selectedPublishUnits,
	availableGroups,
	onFormDataChange,
	onPublishUnitsChange,
}: FormSettingsProps) => {
	return (
		<div className="bg-white border border-slate-300 rounded-md p-6 w-[800px] mb-5">
			<div className="font-medium text-base leading-4 mb-5 text-slate-800">Form Settings</div>
			<div className="w-[508px]">
				<div className="flex items-center gap-6 mb-3">
					<label className="text-sm w-[89px] text-slate-800">Title</label>
					<textarea
						value={formData?.title || ''}
						onChange={(e) => {
							onFormDataChange({ title: e.target.value });
						}}
						placeholder={isNewForm ? "Enter form title" : formData?.title || "Enter form title"}
						rows={1}
						className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
					/>
				</div>
				<div className="flex items-center gap-6 mb-3">
					<label className="text-sm w-[89px] text-slate-800">Description</label>
					<textarea
						value={formData?.description || ''}
						onChange={(e) => {
							onFormDataChange({ description: e.target.value });
						}}
						placeholder={isNewForm ? "Enter form description" : formData?.description || "Enter form description"}
						rows={5}
						className="text-sm flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-900"
					/>
				</div>
				<div className="flex items-center gap-6">
					<label className="text-sm w-[89px] text-slate-800">Unit</label>
					<div className="flex-1">
						<GroupSelector
							selectedGroups={selectedPublishUnits || []}
							availableGroups={availableGroups || []}
							onGroupsChange={onPublishUnitsChange}
							label=""
							placeholder="Select which unit to send to"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
