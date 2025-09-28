import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

export default function SingleChoiceQuestion() {
    return (
        <div className="dropdown-container w-[350px] flex flex-col gap-1.5">
            <p className="input-title  text-sm font-medium text-slate-900">選擇</p>
            <Select>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="@skirano"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option1</SelectItem>
                    <SelectItem value="option2">Option2</SelectItem>
                    <SelectItem value="option3">Option3</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}