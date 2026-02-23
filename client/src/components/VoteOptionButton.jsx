import React from "react";

const VoteOptionButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left
        px-4 py-3
        rounded-xl
        bg-slate-800/70
        hover:bg-indigo-600/20
        border border-slate-700 hover:border-indigo-500/40
        text-slate-200
        transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-95 hover:scale-[1.02]
      "
    >
      {label}
    </button>
  );
};

export default VoteOptionButton;