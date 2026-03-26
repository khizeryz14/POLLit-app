import React from "react";
import { FiUser, FiMail } from "react-icons/fi";

const UserInfo = ({ user }) => {
  if (!user) return null;

  const joinedDate = new Date(user.created_at);
  const formattedDate = joinedDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="
      relative overflow-hidden
      bg-gradient-to-br from-slate-900/80 to-slate-900/40
      border border-slate-800
      rounded-2xl
      p-8 md:p-10
      flex flex-col md:flex-row md:items-center gap-6
      shadow-xl
    ">

      {/* Subtle glow accent */}
      <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none" />

      {/* Avatar */}
      <div className="
        relative z-10
        w-20 h-20 md:w-24 md:h-24
        rounded-full
        bg-indigo-600/20
        flex items-center justify-center
        text-indigo-400 text-3xl
        border border-indigo-500/20
      ">
        <FiUser />
      </div>

      {/* Info */}
      <div className="relative z-10 flex-1 space-y-2">

        {/* Username */}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          {user.username}
        </h1>

        {/* Flavor text */}
        <p className="text-slate-400">
          Polling since {formattedDate}
        </p>

        {/* Poll count */}
        <p className="text-slate-400 text-sm">
          {user.pollCount} polls created
        </p>

        {/* Conditional Email */}
        {user.email && (
          <div className="flex items-center gap-2 text-sm text-indigo-400 mt-2">
            <FiMail />
            {user.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;