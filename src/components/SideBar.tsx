import { NavLink } from "react-router";

export default function SideBar() {
    return (
        <nav className="sticky right-0 flex flex-col border-r min-w-70 bg-slate-100/30 gap-2 h-screen">
            <div className="flex items-center justify-between w-full px-6 min-h-15 border-b">
                <div className="flex gap-2 text-sm/6 item-center justify-center font-semibold">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M17.8 19.2L16 11L19.5 7.5C21 6 21.5 4 21 3C20 2.5 18 3 16.5 4.5L13 8L4.8 6.2C4.3 6.1 3.9 6.3 3.7 6.7L3.4 7.2C3.2 7.7 3.3 8.2 3.7 8.5L9 12L7 15H4L3 16L6 18L8 21L9 20V17L12 15L15.5 20.3C15.8 20.7 16.3 20.8 16.8 20.6L17.3 20.4C17.7 20.1 17.9 19.7 17.8 19.2Z"
                            stroke="black"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                    <span>Core System</span>
                </div>
            </div>
            <div className="px-4">
                <NavLink
                    to="/"
                    className="flex px-3 py-2 gap-3 items-center rounded-lg bg-slate-100 font-medium text-sm"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                    >
                        <path
                            d="M2 6.49998L8 1.83331L14 6.49998V13.8333C14 14.1869 13.8595 14.5261 13.6095 14.7761C13.3594 15.0262 13.0203 15.1666 12.6667 15.1666H3.33333C2.97971 15.1666 2.64057 15.0262 2.39052 14.7761C2.14048 14.5261 2 14.1869 2 13.8333V6.49998Z"
                            stroke="#020617"
                            stroke-width="1.25"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M6 15.1667V8.5H10V15.1667"
                            stroke="#020617"
                            stroke-width="1.25"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                    <span>Home</span>
                </NavLink>
            </div>
        </nav>
    );
}
