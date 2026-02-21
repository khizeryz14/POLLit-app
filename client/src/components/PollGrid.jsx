import React from "react";
import PollCard from "./PollCard";
import { Link } from "react-router-dom";

const PollGrid = ({ polls, onVote }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {polls.map((poll) => (
        <Link key={poll.id} to={`/poll/${poll.id}`}>
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
        </Link>
      ))}
    </div>
  );
};

export default PollGrid;