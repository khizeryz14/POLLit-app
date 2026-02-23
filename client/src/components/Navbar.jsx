import React from "react";
import { FiBarChart2, FiPlusCircle, FiLogIn, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <FiBarChart2 className="text-indigo-500 text-xl" />
            <span className="text-xl font-logo tracking-wide">
              POLLit
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/createPoll">
            <button className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-500
              transition-all duration-200
              font-medium
              shadow-lg shadow-indigo-600/20
              transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]
              active:scale-95 hover:scale-[1.02]
            ">
              <FiPlusCircle />
              Create Poll
            </button>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="
                w-9 h-9 rounded-full
                bg-indigo-600/20
                flex items-center justify-center
                text-indigo-400
                border border-indigo-500/20
              ">
                <FiUser />
              </div>

              <button
                onClick={logout}
                className="text-sm text-slate-400 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth">
              <button className="
                flex items-center gap-2
                px-4 py-2
                rounded-xl
                border border-slate-700
                hover:border-slate-500
                hover:bg-slate-900
                transition-all duration-200
                font-medium
                transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]
                active:scale-95 hover:scale-[1.02]
              ">
                <FiLogIn />
                Log In
              </button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;