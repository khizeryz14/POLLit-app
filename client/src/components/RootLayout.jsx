import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const RootLayout = () => {
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
        <Navbar/>
        <main>
            <Outlet />
        </main>
        <Footer/>
    </div>
}

export default RootLayout;