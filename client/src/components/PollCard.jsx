import React, { useEffect, useState } from "react";
import { FiBarChart2, FiClock, FiArrowRight, FiCheck } from "react-icons/fi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultImage from "../assets/defaultPoll.jpg";

const PollCard = ({
  pollId,
  title,
  description,
  options = [],
  totalVotes = 0,
  timeLeft = "",
  image,
  hasVoted = false,
  onVote
}) => {

  const pollImage = image || defaultImage;
  const safeOptions = Array.isArray(options) ? options : [];

  const [selected, setSelected] = useState(null);
  const [animateBars, setAnimateBars] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const total = totalVotes || 0;
  const isExpired = timeLeft === "Ended";

  const getPercent = (votes) => {
    if (!total) return 0;
    return Math.round((votes / total) * 100);
  };

  useEffect(() => {
    if (hasVoted || isExpired) {
      setAnimateBars(false);
      setTimeout(() => setAnimateBars(true), 50);
    }
  }, [hasVoted, isExpired]);

  const handleVote = async (e, optionId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }

    if (hasVoted || isVoting || isExpired) return;

    setIsVoting(true);

    const res = await onVote?.(pollId, optionId);

    if (res?.success || res?.alreadyVoted) {
      setSelected(optionId);
    }

    setIsVoting(false);
  };

  return (
    <div className="group bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-600/10">

      <Link to={`/polls/${pollId}`}>
        <div className="h-40 w-full overflow-hidden">
          <img
            src={pollImage}
            alt="Poll"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-medium tracking-tight group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            <FiBarChart2 className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>

          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            {description || "No description provided"}
          </p>
        </div>
      </Link>

      {/* OPTIONS */}
      <div className="px-5 pb-4 space-y-2">
        {safeOptions.slice(0, 2).map(opt => {

          const percent = getPercent(opt.votes);
          const isSelected = selected === opt.id;

          return (hasVoted || isExpired) ? (
            <div
              key={opt.id}
              className="relative w-full text-sm bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 overflow-hidden"
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500/50 to-indigo-400/30 transition-all duration-700 ease-out rounded-lg"
                style={{
                  width: animateBars ? `${percent}%` : "0%"
                }}
              />

              <div className="relative flex justify-between items-center">
                <span className="flex items-center gap-2">
                  {isSelected && <FiCheck className="text-emerald-400" />}
                  {opt.text}
                </span>

                <span className="text-xs text-indigo-300">
                  {percent}%
                </span>
              </div>
            </div>

          ) : (
            <button
              key={opt.id}
              onClick={(e) => handleVote(e, opt.id)}
              disabled={isExpired}
              className={`
                w-full text-left text-sm
                bg-slate-800/70
                border border-transparent
                rounded-lg px-3 py-2
                text-slate-300
                transition-transform duration-150
                ${isExpired
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-indigo-600/20 hover:border-indigo-500/30 active:scale-95 hover:scale-[1.02]"
                }
              `}
            >
              {opt.text}
            </button>
          );

        })}

        {safeOptions.length > 2 && (
          <Link
            to={`/polls/${pollId}`}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 pl-1 pt-1 transition-colors"
          >
            +{safeOptions.length - 2} more options
            <FiArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="px-5 pb-5 flex items-center justify-between text-xs text-slate-500">
        <span>{totalVotes} votes</span>

        <div className="flex items-center gap-1">
          <FiClock />
          <span>{timeLeft || "Active"}</span>
        </div>
      </div>

    </div>
  );
};

export default PollCard;