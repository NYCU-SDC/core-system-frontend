import * as React from "react";

type HoverCardContainerProps = {
    children: React.ReactNode;
}

export default function HoverCardContainer ({children}: HoverCardContainerProps){
    return (
        <div className="hover-card-container pr-4 pl-7 bg-white h-[545px] overflow-y-auto">
            {children}
        </div>
    )
}

export function HoverCardSelectorContent({ children }: { children: React.ReactNode }) {
    const [selected, setSelected] = React.useState(false);

    const handleClick = () => {
        setSelected(!selected);
    };
    return (
        <div
            className={`py-1.5 px-3 rounded-[6px] cursor-pointer ${selected ? "bg-slate-200" : "hover:bg-slate-100"}`}
            onClick={handleClick}
        >
            {children}
        </div>
    );
}
// className for selected or not selected item need check
