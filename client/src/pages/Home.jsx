import React from "react";
import PollGrid from "../components/PollGrid";
import { usePoll } from "../context/PollContext"


const Home = () => {

  const {polls, loading, votePoll} = usePoll();

  const handleVote = (pollId, optionId) => {
    votePoll(pollId, optionId);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-gray-400">Loading polls...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 animate-[fadeIn_.3s_ease]">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        Trending Polls
      </h1>

      <PollGrid polls={polls} onVote={handleVote} />
    </div>
  );
};

export default Home;