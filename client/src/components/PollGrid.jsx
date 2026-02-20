import React from "react";
import PollCard from "./PollCard";

const PollGrid = ({ polls, onVote }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          title={poll.title}
          description={poll.description}
          options={poll.options}
          totalVotes={poll.totalVotes}
          timeLeft={poll.timeLeft}
          image={poll.image}
          onVote={onVote}
        />
      ))}
    </div>
  );
};

export default PollGrid;