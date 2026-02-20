import React from "react";
import VoteOptionButton from "../components/VoteOptionButton";
import ResultsBar from "../components/ResultsBar";
import defaultImage from "../assets/defaultPoll.jpg";

const PollView = () => {
  const poll = {
    title: "Best Frontend Framework in 2026?",
    description:
      "Vote for the framework you believe offers the best developer experience and ecosystem.",
    image: defaultImage,
    totalVotes: 742,
    timeLeft: "3 hours remaining",
    options: [
      { label: "React", percentage: 64 },
      { label: "Vue", percentage: 21 },
      { label: "Svelte", percentage: 15 },
    ],
  };

  const handleVote = (option) => {
    alert(`Voted for ${option}`);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="
        bg-slate-900/60
        backdrop-blur-md
        border border-slate-800
        rounded-2xl
        overflow-hidden
        shadow-lg shadow-black/30
      ">
        {/* Image */}
        <div className="h-56 overflow-hidden">
          <img
            src={poll.image}
            alt="Poll"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          {/* Title */}
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            {poll.title}
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-6">
            {poll.description}
          </p>

          {/* Voting Section */}
          <div className="space-y-3 mb-8">
            {poll.options.map((opt) => (
              <VoteOptionButton
                key={opt.label}
                label={opt.label}
                onClick={() => handleVote(opt.label)}
              />
            ))}
          </div>

          {/* Results */}
          <div className="space-y-3 mb-6">
            {poll.options.map((opt) => (
              <ResultsBar
                key={opt.label}
                label={opt.label}
                percentage={opt.percentage}
              />
            ))}
          </div>

          {/* Meta */}
          <div className="flex justify-between text-xs text-slate-500 border-t border-slate-800 pt-4">
            <span>{poll.totalVotes} votes</span>
            <span>{poll.timeLeft}</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PollView;