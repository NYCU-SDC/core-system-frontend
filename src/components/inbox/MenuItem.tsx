const MenuItem = ({ children, active = false }: { children: React.ReactNode; active?: boolean }) => {
    return (
        <div
            className={`py-1.5 px-3 rounded-lg font-medium text-sm ${
                active ? "bg-slate-500 text-slate-100" : "bg-slate-100 text-slate-800"
            }`}
        >
            {children}
        </div>
    )
}

export default MenuItem
