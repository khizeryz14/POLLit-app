import React, { useState, useRef, useEffect } from "react";
import {
  FiBarChart2,
  FiPlusCircle,
  FiLogIn,
  FiUser,
  FiChevronDown,
  FiLogOut,
  FiList,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="relative" ref={dropdownRef}>
              
              {/* USER DISPLAY */}
              <div
                onClick={() => setOpen(!open)}
                className="
                  flex items-center gap-2 cursor-pointer
                  px-3 py-1.5 rounded-xl
                  hover:bg-slate-900 transition
                "
              >
                <div className="
                  w-9 h-9 rounded-full
                  bg-indigo-600/20
                  flex items-center justify-center
                  text-indigo-400
                  border border-indigo-500/20
                ">
                  <FiUser />
                </div>

                <span className="text-sm font-medium text-slate-200">
                  {user.username}
                </span>

                <FiChevronDown
                  className={`text-slate-400 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* DROPDOWN */}
              {open && (
                <div className="
                  absolute right-0 mt-2 w-44
                  bg-slate-900 border border-slate-800
                  rounded-xl shadow-xl
                  overflow-hidden
                  animate-in fade-in zoom-in-95
                ">
                  
                  <Link
                    to="/polls"
                    onClick={() => setOpen(false)}
                    className="
                      flex items-center gap-2
                      px-4 py-2 text-sm
                      text-slate-300 hover:text-white
                      hover:bg-slate-800 transition
                    "
                  >
                    <FiList />
                    My Polls
                  </Link>

                  <Link
                    to={`/user/${user.username}`}
                    onClick={() => setOpen(false)}
                    className="
                      flex items-center gap-2
                      px-4 py-2 text-sm
                      text-slate-300 hover:text-white
                      hover:bg-slate-800 transition
                    "
                  >
                    <FiUser />
                    Profile
                  </Link>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={logout}
                    className="
                      w-full flex items-center gap-2
                      px-4 py-2 text-sm
                      text-red-400 hover:text-red-300
                      hover:bg-slate-800
                      transition
                    "
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
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