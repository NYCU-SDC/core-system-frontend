
import  useGetUnit  from '@/hooks/useGetUnit.ts';
type MenuItemProps = {
    children?: React.ReactNode;
    active?: boolean;
    id?: string | null; // 新增 unitId prop
};

const MenuItem = ({ children, active = false, id }: MenuItemProps) => {


    const { data: unit, isLoading, isError } = useGetUnit(id || "");
    //console.log(id);
    // 一行決定顯示文字
    const displayText = !id ? children
        : isLoading ? "Loading..."
            : isError ? "Unknown Unit"
                : unit?.name || "Unit";

    return (
        <a
        className={`py-1.5 px-3 rounded-lg font-medium text-sm ${
            active ? "bg-slate-500 text-slate-100" : "bg-slate-100 text-slate-800"
        }`}>
            {displayText}
        </a>
    );
}

export default MenuItem
