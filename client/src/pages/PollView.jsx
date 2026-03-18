import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiClock, FiCheck, FiUser } from "react-icons/fi";
import { usePoll } from "../context/PollContext";
import defaultImage from "../assets/defaultPoll.jpg";

const PollView = () => {

  const { pollId } = useParams();
  const { getPollById, votePoll } = usePoll();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  /* =========================
     Load Poll
  ========================== */

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPollById(pollId);
      setPoll(data);
      setLoading(false);
    };
    load();
  }, [pollId]);

  /* =========================
     Animate bars AFTER poll is final
  ========================== */

  useEffect(() => {
    if (poll?.hasVoted) {
      setAnimateBars(false);
      setTimeout(() => setAnimateBars(true), 50);
    }
  }, [poll]);

  /* =========================
     Handle Vote (NO optimistic UI)
  ========================== */

  const handleVote = async (optionId) => {

    if (!poll || poll.hasVoted || isVoting) return;

    setIsVoting(true);

    const res = await votePoll(poll.id, optionId);

    if (!res?.success && !res?.alreadyVoted) {
      setIsVoting(false);
      return;
    }

    // fetch FINAL truth from DB
    const updated = await getPollById(poll.id);

    setSelected(optionId); // now safe (correct option)
    setPoll(updated);      // now percentages are correct
    setIsVoting(false);
  };

  /* =========================
     UI States
  ========================== */

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-slate-400">
        Loading poll...
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-red-400">
        Poll not found
      </div>
    );
  }

  const pollImage = poll.image || defaultImage;
  const totalVotes = poll.totalVotes || 0;
  const hasVoted = poll.hasVoted;

  const getPercent = (votes) => {
    if (!totalVotes) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  /* =========================
     Render
  ========================== */

  return (
    <div className="max-w-3xl mx-auto p-6">

      <div className="
        bg-slate-900/70
        backdrop-blur-md
        border border-slate-700/50
        rounded-2xl
        shadow-xl
        p-6
      ">

        {/* USER */}
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="text-indigo-400" />
          <Link
            to={`/user/${poll.username}`}
            className="text-slate-300 hover:text-indigo-300 transition text-sm"
          >
            {poll.username}
          </Link>
        </div>

        {/* IMAGE */}
        <div className="h-56 w-full overflow-hidden rounded-xl mb-6">
          <img
            src={pollImage}
            alt="Poll"
            className="w-full h-full object-cover"
          />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold mb-2">
          {poll.title}
        </h1>

        {/* DESCRIPTION */}
        <p className="text-slate-400 mb-6">
          {poll.description || "No description provided"}
        </p>

        {/* OPTIONS */}
        <div className="space-y-3 mb-6">

          {poll.options.map(option => {

            const percent = getPercent(option.votes);
            const isSelected = selected === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isVoting}
                className={`
                  relative w-full text-left
                  bg-slate-800/70
                  border border-slate-700
                  rounded-lg px-4 py-3
                  text-slate-300
                  overflow-hidden
                  transition-all duration-200
                  ${!hasVoted ? "hover:bg-indigo-600/20 hover:border-indigo-500/30 hover:scale-[1.01] active:scale-95" : ""}
                  ${isSelected && hasVoted ? "border-emerald-400/40 bg-emerald-500/10" : ""}
                `}
              >

                {/* RESULT BAR */}
                <div
                  className="
                    absolute inset-y-0 left-0
                    bg-gradient-to-r from-indigo-500/50 to-indigo-400/30
                    transition-all duration-700 ease-out
                    rounded-lg
                  "
                  style={{
                    width:
                      hasVoted && animateBars
                        ? `${percent}%`
                        : "0%"
                  }}
                />

                {/* CONTENT */}
                <div className="relative flex items-center justify-between">

                  <span className="flex items-center gap-2">

                    {isSelected && hasVoted && (
                      <FiCheck className="text-emerald-400" />
                    )}

                    {option.text}

                  </span>

                  <span className="text-sm w-10 text-right text-indigo-300 font-medium">
                    {hasVoted ? `${percent}%` : ""}
                  </span>

                </div>

              </button>
            );

          })}

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between text-sm text-slate-500">

          <span>{poll.totalVotes} votes</span>

          <div className="flex items-center gap-1">
            <FiClock />
            <span>{poll.timeLeft || "Active"}</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PollView;