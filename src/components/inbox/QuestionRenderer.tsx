// components/form/QuestionRenderer.tsx - 問題渲染組件
import { InboxItemContentResponse } from '@/types/inbox.ts';
import ShortTextQuestion from './ShortTextQuestion';
import LongTextQuestion from './LongTextQuestion';
import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';


type QuestionRendererProps = {
    question: Question;
    value: string | string[] | undefined;
    onChange: (questionId: string, value: string | string[]) => void;
    onToggleMultiple: (questionId: string, optionValue: string) => void;
};

const QuestionRenderer = ({ question, value, onChange, onToggleMultiple }: QuestionRendererProps) => {
    const commonProps = {
        question,
        value,
        onChange
    };

    switch (question.type) {
        case 'short_text':
            return <ShortTextQuestion {...commonProps} />;
        case 'long_text':
            return <LongTextQuestion {...commonProps} />;
        case 'single_choice':
            return <SingleChoiceQuestion {...commonProps} />;
        case 'multiple_choice':
            return <MultipleChoiceQuestion {...commonProps} onToggle={onToggleMultiple} />;
        default:
            return <div>未知的問題類型</div>;
    }
};

export default QuestionRenderer;