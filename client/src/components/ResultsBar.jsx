import React from "react";

const ResultsBar = ({ label, percentage }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-slate-400">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>

      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ResultsBar;