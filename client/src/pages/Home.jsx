import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { usePoll } from "../context/PollContext";
import PollGrid from "../components/PollGrid";
import PollCard from "../components/PollCard";

const Home = () => {
  const { polls, fetchPolls, loading, votePoll } = usePoll();

  useEffect(() => {
    fetchPolls({ page: 1, sort: "trending", reset: true });
  }, []);

  const handleVote = (pollId, optionId) => {
    votePoll(pollId, optionId);
  };

  const featured = polls.slice(0, 6);
  const latest = polls.slice(6, 12);

  return (
    <div className="w-full flex flex-col items-center animate-[fadeIn_0.3s_ease]">

      {/* 🔥 HERO (Animated Gradient) */}
      <section className="w-full relative overflow-hidden">

        {/* animated gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#020617,#020617,#0f172a,#1e1b4b,#0f172a,#020617)] bg-[length:250%_250%] animate-gradientMove" />
        {/* glow */}
        {/* <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-3xl rounded-full" /> */}

        <div className="relative max-w-6xl mx-auto px-6 py-32 text-center">
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Shape Opinions.
            <br />
            <span className="text-indigo-400">One Vote at a Time.</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Create polls, explore trends, and engage with real opinions.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/polls"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition hover:scale-[1.03]"
            >
              Explore Polls <FiArrowRight />
            </Link>

            <Link
              to="/createPoll"
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-900 transition hover:scale-[1.03]"
            >
              Create Poll
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="w-full max-w-6xl px-6 mt-16">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FiTrendingUp className="text-indigo-400" />
            Trending Now
          </h2>

          <Link
            to="/polls"
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            View all <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading polls...</p>
        ) : (
          <div className="relative">

            {/* Clip scrollbar visually */}
            <div className="overflow-hidden">
              <div
                className="
                  flex gap-4
                  overflow-x-auto overflow-y-hidden
                  scroll-smooth snap-x snap-mandatory
                  pb-4
                  pr-2
                "
                style={{ scrollbarWidth: "none" }}
              >
                {featured.map((poll) => (
                  <div
                    key={poll.id}
                    className="
                      min-w-[300px] max-w-[300px]
                      flex-shrink-0
                      snap-start
                    "
                  >
                    {/* Force consistent height */}
                    <div className="h-full rounded-xl">
                      <PollCard
                        pollId={poll.id}
                        title={poll.title}
                        description={
                          poll.description?.length > 120
                            ? poll.description.slice(0, 120) + "..."
                            : poll.description
                        }
                        options={poll.options}
                        totalVotes={poll.totalVotes}
                        timeLeft={poll.timeLeft}
                        image={poll.image}
                        hasVoted={poll.hasVoted}
                        onVote={handleVote}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </section>

      {/* LATEST */}
      <section className="w-full max-w-6xl px-6 mt-16 mb-20">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Latest Activity</h2>

          <Link
            to="/polls"
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Browse more <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading polls...</p>
        ) : (
          <PollGrid polls={latest} onVote={handleVote} />
        )}
      </section>

    </div>
  );
};

export default Home;