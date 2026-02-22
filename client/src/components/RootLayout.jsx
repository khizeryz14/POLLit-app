import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function RootLayout(){
    const location = useLocation();
    const hideLayout = !(location.pathname === "/auth")

    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
        {hideLayout && <Navbar/>}
        <main className="flex-1 flex" >
            <Outlet />
        </main>
        {hideLayout && <Footer/>}
    </div>
}

export default RootLayout;