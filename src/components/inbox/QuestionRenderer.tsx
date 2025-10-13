import type { InboxItemContentResponse } from '@/types/inbox.ts';
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CalendarIcon} from "lucide-react";
import {cn} from "@/lib/utils";
// import ShortTextQuestion from './ShortTextQuestion';
// import LongTextQuestion from './LongTextQuestion';
// import SingleChoiceQuestion from './SingleChoiceQuestion';
// import MultipleChoiceQuestion from './MultipleChoiceQuestion';


type QuestionRendererProps = {
    q: InboxItemContentResponse;
    value?: string | string[];
    onChange?: (v: string | string[]) => void;
};

const QuestionRenderer = ({ q, value, onChange }: QuestionRendererProps) => {
    switch (q.type){
        case 'short_text':
            return (
                <div className="short-input-container w-[350px] flex flex-col gap-1.5">
                    <p className="input-title text-sm font-medium text-slate-900">{q.title}</p>
                    <Input
                        type="text"
                        placeholder={q.description}
                        value={value as string || ''}
                        onChange={(e) => onChange?.(e.target.value)}
                    />
                </div>
            )
        case 'long_text':
            return(
                <div className="long-input-container w-[350px] flex flex-col gap-1.5">
                    <p className="input-title text-sm font-medium text-slate-900 border-slate-300">{q.title}</p>
                    <Textarea
                        placeholder={q.description}
                        value={value as string || ''}
                        onChange={(e) => onChange?.(e.target.value)}
                    />
                </div>
            )
        case 'single_choice':
            return(
                <div className="dropdown-container w-[350px] flex flex-col gap-1.5">
                    <p className="input-title  text-sm font-medium text-slate-900">{q.title}</p>
                    <Select value={value as string || ''} onValueChange={(v) => onChange?.(v)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={q.description} />
                        </SelectTrigger>
                        <SelectContent>
                            {q.choices.map((choice) => (
                                <SelectItem key={choice.id} value={choice.id}>
                                    {choice.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )
        case 'date':
            return (
                <div className="date-container w-[350px] flex flex-col gap-1.5">
                    <p className="input-title text-sm font-medium text-slate-900">{q.title}</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {value ? new Date(value as string).toLocaleDateString('zh-TW') : <span>{q.description || "選擇日期"}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={value ? new Date(value as string) : undefined}
                                onSelect={(date) => onChange?.(date ? date.toISOString() : '')}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            )
        // case 'multiple_choice':
        //     return(
        //
        //     )

    }
};

export default QuestionRenderer;