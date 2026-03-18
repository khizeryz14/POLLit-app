import React from "react";
import PollCard from "./PollCard";

const PollGrid = ({ polls, onVote }) => {
  if (!polls || polls.length === 0) {
    return <p className="text-slate-400">No polls yet.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          pollId={poll.id}
          title={poll.title}
          description={poll.description}
          options={poll.options}
          totalVotes={poll.totalVotes}
          timeLeft={poll.timeLeft}
          image={poll.image}
          onVote={onVote}
          hasVoted={poll.hasVoted}
        />
      ))}
    </div>
  );
};

export default PollGrid;