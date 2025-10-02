// components/form/QuestionRenderer.tsx - 問題渲染組件
import type { InboxItemContentResponse } from '@/types/inbox.ts';
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
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
                    <Input type="text" placeholder={q.description}></Input>
                </div>
            )
        case 'long_text':
            return(
                <div className="long-input-container w-[350px] flex flex-col gap-1.5">
                    <p className="input-title text-sm font-medium text-slate-900 border-slate-300">{q.title}</p>
                    <Textarea placeholder={q.description}/>
                </div>
            )
        case 'single_choice':
            return(
                <div className="dropdown-container w-[350px] flex flex-col gap-1.5">
                    <p className="input-title  text-sm font-medium text-slate-900">{q.title}</p>
                    <Select >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={q.description} />
                        </SelectTrigger>
                        <SelectContent>
                            {q.choices.map((choice) => (
                                <SelectItem key={choice.id} value={choice.name}>
                                    {choice.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )
        // case 'multiple_choice':
        //     return(
        //
        //     )
        // case 'date':
        //     return(
        //
        //     )

    }
};

export default QuestionRenderer;