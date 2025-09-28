import MenuItem from "./MenuItem"
type MenuBarProps = {
    /** 不含 "All" 的單位 ID 清單，例如 ["unit-1","unit-2"] */
    units: string[];
    /** 目前選中的單位（包含 "All" 時代表全選） */
    selected: string[]; // e.g. ["All"] 或 ["unit-1","unit-3"]
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
        // 按下 All -> 只保留 All
        onChange([ALL]);
    };

    const toggleUnit = (unit: string) => {
        // 如果現在是 All，被點了某個 unit，就從 All 切到只有這個 unit
        if (hasAll) {
            onChange([unit]);
            return;
        }
        // 否則就在 selected 內切換
        const set = new Set(selected);
        if (set.has(unit)) set.delete(unit);
        else set.add(unit);

        const arr = Array.from(set);
        if (arr.length === units.length) {
            onChange([ALL]);
            return;
        }
        // 若清空了，就回到 All
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


