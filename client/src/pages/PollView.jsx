import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import { usePoll } from "../context/PollContext";
import defaultImage from "../assets/defaultPoll.jpg";

const PollView = () => {

  const { pollId } = useParams();
  const { getPollById, votePoll } = usePoll();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {

    const loadPoll = async () => {

      setLoading(true);

      const data = await getPollById(pollId);

      setPoll(data);

      setLoading(false);
    };

    loadPoll();

  }, [pollId]);

  const handleVote = async (optionId) => {

    if (hasVoted) return;

    setSelectedOption(optionId);
    setHasVoted(true);

    await votePoll(poll.id, optionId);

  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-slate-400">Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-400">Poll not found</p>
      </div>
    );
  }

  const pollImage = poll.image || defaultImage;

  const totalVotes = poll.totalVotes || 0;

  const getPercent = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* Image */}
      <div className="h-56 w-full overflow-hidden rounded-xl mb-6">
        <img
          src={pollImage}
          alt="Poll"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-2">
        {poll.title}
      </h1>

      {/* Description */}
      <p className="text-slate-400 mb-6">
        {poll.description || "No description provided"}
      </p>

      {/* Options */}
      <div className="space-y-3 mb-6">

        {poll.options.map(option => {

          const percent = getPercent(option.votes);

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted}
              className={`
                relative w-full text-left
                bg-slate-800/70
                border border-slate-700
                rounded-lg px-4 py-3
                text-slate-300
                overflow-hidden
                transition
                ${selectedOption === option.id ? "ring-2 ring-indigo-500" : ""}
              `}
            >

              {/* Animated Result Fill */}
              {hasVoted && (
                <div
                  className="
                    absolute inset-y-0 left-0
                    bg-indigo-600/30
                    transition-all duration-700 ease-out
                  "
                  style={{ width: `${percent}%` }}
                />
              )}

              {/* Content */}
              <div className="relative flex items-center justify-between">

                <span>{option.text}</span>

                {hasVoted && (
                  <span className="text-sm text-slate-300">
                    {percent}%
                  </span>
                )}

              </div>

            </button>
          );

        })}

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-500">

        <span>{poll.totalVotes} votes</span>

        <div className="flex items-center gap-1">
          <FiClock />
          <span>{poll.timeLeft || "Active"}</span>
        </div>

      </div>

    </div>
  );
};

export default PollView;