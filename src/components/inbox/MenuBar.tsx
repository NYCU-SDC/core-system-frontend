import MenuItem from "./MenuItem"

const MenuBar = () => {
    return (
        <div className="flex flex-row gap-1.5 h-fit w-full">
            <MenuItem>All</MenuItem>
            <MenuItem active>Unit2</MenuItem>
            <MenuItem>Unit3</MenuItem>
            <MenuItem>Unit4</MenuItem>
        </div>
    )
}

export default MenuBar
