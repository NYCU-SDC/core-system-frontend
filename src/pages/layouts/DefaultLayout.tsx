import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";
import { Outlet } from "react-router-dom";
export default function DefaultLayout() {
    return (
        <div className="flex">
            <SideBar />
            <div className="flex flex-col grow">
                <NavBar />
                <main className="flex grow">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
