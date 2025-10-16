type MenuItemProps = {
	children?: React.ReactNode;
	active?: boolean;
	id?: string | null;
};

const MenuItem = ({ children, active = false }: MenuItemProps) => {
	return <div className={`inline-block py-1.5 px-3 rounded-lg font-medium text-sm whitespace-nowrap ${active ? "bg-slate-500 text-slate-100" : "bg-slate-100 text-slate-800"}`}>{children}</div>;
};

export default MenuItem;
