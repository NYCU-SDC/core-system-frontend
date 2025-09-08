"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label.tsx"
import { ScrollArea } from "@/components/ui/scroll-area.tsx"

interface GroupSelectorProps {
	selectedGroups: string[]
	availableGroups: string[]
	onGroupsChange: (groups: string[]) => void
	label?: string
	placeholder?: string
}

export function GroupSelector({
								  selectedGroups,
								  availableGroups,
								  onGroupsChange,
								  label = "Units",
								  placeholder = "Select groups"
							  }: GroupSelectorProps) {
	const [isOpen, setIsOpen] = useState(false)

	const toggleGroup = (group: string) => {
		const newGroups = selectedGroups.includes(group)
			? selectedGroups.filter((g) => g !== group)
			: [...selectedGroups, group]
		onGroupsChange(newGroups)
	}

	const getDisplayText = () => {
		if (selectedGroups.length === 0) {
			return placeholder
		}
		if (selectedGroups.length === 1) {
			return selectedGroups[0]
		}
		return `${selectedGroups.length} units selected`
	}

	return (
		<div className="relative">
			{label && <Label>{label}</Label>}

			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full px-3 py-2 text-left border border-slate-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent flex justify-between items-center"
			>
                <span className={`text-sm ${selectedGroups.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                    {getDisplayText()}
                </span>
				<svg
					className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-300 rounded-md shadow-lg">
					<ScrollArea className="p-2 max-h-[120px]">
						{availableGroups.map((group) => (
							<div key={group} className="flex items-center gap-2 py-1 hover:bg-gray-100 px-2 rounded accent-slate-800">
								<input
									type="checkbox"
									id={`group-${group}`}
									checked={selectedGroups.includes(group)}
									onChange={() => toggleGroup(group)}
									className="cursor-pointer"
								/>
								<label
									htmlFor={`group-${group}`}
									className="text-sm cursor-pointer flex-1"
								>
									{group}
								</label>
							</div>
						))}
					</ScrollArea>
				</div>
			)}

			{isOpen && (
				<div
					className="fixed inset-0 z-0"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</div>
	)
}