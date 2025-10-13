import MenuItem from "./MenuItem"
type MenuBarProps = {
    units: string[];
    selected: string[];
    onChange: (nextSelected: string[]) => void;
};
const ALL = "All";
export default function MenuBar ({
                     units,
                     selected,
                     onChange,
                 }: MenuBarProps)  {

    const hasAll = selected.includes(ALL);

    const toggleAll = () => {
        onChange([ALL]);
    };

    const toggleUnit = (unit: string) => {
        if (hasAll) {
            onChange([unit]);
            return;
        }
        const set = new Set(selected);
        if (set.has(unit)) set.delete(unit);
        else set.add(unit);

        const arr = Array.from(set);
        if (arr.length === units.length) {
            onChange([ALL]);
            return;
        }
        onChange(arr.length === 0 ? [ALL] : arr);
    };

    const isActive = (key: string) =>
        key === ALL ? hasAll : !hasAll && selected.includes(key);
    return (
        <div className="flex flex-row gap-1.5 h-fit w-full">
            <div onClick={toggleAll}>
                <MenuItem active={isActive(ALL)}>{ALL}</MenuItem>
            </div>
            {units.map((u) => (
                <div key={u} onClick={() => toggleUnit(u)}>
                    <MenuItem active={isActive(u)} id={u}>{u}</MenuItem>
                </div>
            ))}
        </div>
    )
}


