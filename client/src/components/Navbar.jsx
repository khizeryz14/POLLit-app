import React from "react";
import { FiBarChart2, FiPlusCircle, FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <FiBarChart2 className="text-indigo-500 text-xl" />
          <span className="text-xl font-logo tracking-wide">
            POLLit
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/createPoll">
            <button className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-500
              active:scale-95
              transition-all duration-200
              font-medium
              shadow-lg shadow-indigo-600/20
            ">
              <FiPlusCircle />
              Create Poll
            </button>
          </Link>

          <button className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            border border-slate-700
            hover:border-slate-500
            hover:bg-slate-900
            transition-all duration-200
            font-medium
          ">
            <FiLogIn />
            Log In
          </button>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;
