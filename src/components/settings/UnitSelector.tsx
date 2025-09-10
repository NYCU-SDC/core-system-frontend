import * as React from "react";

type UnitSelectorContextType = {
	selected: string;
	toggle: (value: string) => void;
	isSelected: (value: string) => boolean;
};

type UnitSelectorContainerProps = {
	children: React.ReactNode;
	value?: string[];
};

export function UnitSelectorContainer({ children, value }: UnitSelectorContainerProps) {
	return <div className="flex py-1 px-1.25 gap-1 bg-white rounded-[6px] w-fit">{children}</div>;
}

export function UnitSelectorContent({ children }: { children: React.ReactNode }) {
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
