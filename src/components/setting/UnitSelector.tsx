import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";

type UnitSelectorContextType = {
	value: string[];
	toggle: (value: string) => void;
};

type UnitSelectorContainerProps = {
	children: ReactNode;
	value: string[];
	onSelect: (value: string[]) => void;
};

type UnitSelectorContentProps = {
	children: ReactNode;
	itemKey: string;
};

const UnitSelectorContext = createContext<UnitSelectorContextType | null>(null);

export function UnitSelectorContainer({ value, onSelect, children }: UnitSelectorContainerProps) {
	const toggle = useCallback(
		(val: string) => {
			if (value.includes(val)) {
				onSelect(value.filter(v => v !== val));
			} else {
				onSelect([...value, val]);
			}
		},
		[value, onSelect]
	);

	const context = useMemo(() => ({ value, toggle }), [value, toggle]);

	return (
		<UnitSelectorContext.Provider value={context}>
			<div className="flex py-1 px-1.25 gap-1 bg-white rounded-[6px] w-fit">{children}</div>
		</UnitSelectorContext.Provider>
	);
}

export function UnitSelectorContent({ children, itemKey }: UnitSelectorContentProps) {
	const { value, toggle } = useContext(UnitSelectorContext)!;
	const selected = value.includes(itemKey);

	const handleClick = () => {
		toggle(itemKey);
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
