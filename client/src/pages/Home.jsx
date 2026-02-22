import React from "react";
import PollGrid from "../components/PollGrid";
import defaultImage from "../assets/defaultPoll.jpg";

const mockPolls = [
  {
    id: 1,
    title: "Best Programming Language?",
    description: "Vote for the language you enjoy working with the most.",
    options: ["JavaScript", "Python", "Rust"],
    totalVotes: 128,
    timeLeft: "2h left",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  },
  {
    id: 2,
    title: "Cats vs Dogs?",
    description: "An eternal internet debate.",
    options: ["Cats", "Dogs"],
    totalVotes: 542,
    timeLeft: "Ends today",
    // No image → default fallback used
  },
  {
    id: 3,
    title: "Preferred Database?",
    description: "Which database do you prefer for modern apps?",
    options: ["PostgreSQL", "MongoDB"],
    totalVotes: 214,
    timeLeft: "5h left",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
  },
];

const Home = () => {
  const handleVote = (option) => {
    alert(`You voted for ${option}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-[fadeIn_.3s_ease]">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        Trending Polls
      </h1>

      <PollGrid polls={mockPolls} onVote={handleVote} />
    </div>
  );
};

export default Home;