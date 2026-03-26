import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function RootLayout() {
  const location = useLocation();

  const hideLayout = location.pathname === "/auth";

  /* 🔥 GLOBAL TOAST STATE */
  const [toast, setToast] = useState(null);

  /* 🔥 AUTO DISMISS */
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">

      {/* NAVBAR */}
      {!hideLayout && <Navbar showToast={setToast} />}

      {/* MAIN */}
      <main className="flex-1 flex">
        <Outlet context={{ showToast: setToast }} />
      </main>

      {/* FOOTER */}
      {!hideLayout && <Footer />}

      {/* 🔥 GLOBAL TOAST */}
      {toast && (
        <div
          className="
            fixed bottom-6 right-6 z-50
            bg-slate-800 text-white
            px-4 py-2 rounded-lg
            text-sm shadow-lg
            border border-slate-700
            animate-[fadeIn_0.2s_ease]
          "
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default RootLayout;