import React from "react";
import { FiBarChart2, FiClock } from "react-icons/fi";
import defaultImage from "../assets/defaultPoll.jpg";

const PollCard = ({
  title,
  description,
  options,
  totalVotes,
  timeLeft,
  image,
  onVote,          // optional
}) => {
  const pollImage = image || defaultImage;

  return (
    <div className="
      group
      bg-slate-900/60
      backdrop-blur-md
      border border-slate-800
      rounded-2xl
      overflow-hidden
      transition-all duration-300
      hover:-translate-y-1
      hover:border-indigo-500/40
      hover:shadow-lg hover:shadow-indigo-600/10
    ">
      {/* Image */}
      <div className="h-40 w-full overflow-hidden">
        <img
          src={pollImage}
          alt="Poll"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-medium tracking-tight group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>

          <FiBarChart2 className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>

        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Options + Voting */}
        <div className="space-y-2 mb-4">
          {options?.slice(0, 2).map((opt, i) => (
            <button
              key={i}
              onClick={() => onVote && onVote(opt)}
              className={`
                w-full text-left text-sm
                bg-slate-800/70
                hover:bg-indigo-600/20
                border border-transparent hover:border-indigo-500/30
                rounded-lg px-3 py-2
                text-slate-300
                transition-all duration-200
                ${onVote ? "cursor-pointer" : "cursor-default"}
              `}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{totalVotes} votes</span>

          <div className="flex items-center gap-1">
            <FiClock />
            <span>{timeLeft}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
