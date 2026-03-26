import React, { useEffect, useState } from "react";
import { usePoll } from "../context/PollContext";
import PollGrid from "../components/PollGrid";
import SearchBar from "../components/SearchBar";

const BrowsePolls = () => {
  const { polls, fetchPolls, loading, hasMore, page } = usePoll();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("new");

  //Initial load
  useEffect(() => {
    fetchPolls({ page: 1, search, sort, reset: true });
  }, []);

  //Search change
  useEffect(() => {
    fetchPolls({ page: 1, search, sort, reset: true });
  }, [search]);

  //Sort change
  useEffect(() => {
    fetchPolls({ page: 1, search, sort, reset: true });
  }, [sort]);

  const handleLoadMore = () => {
    fetchPolls({
      page: page + 1,
      search,
      sort
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 animate-[fadeIn_0.3s_ease]">

      {/* Search + Sort */}
      <SearchBar
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      {/* Polls */}
      <PollGrid polls={polls} />

      {/* Loading */}
      {loading && (
        <p className="text-center text-slate-400 mt-4">Loading...</p>
      )}

      {/* Load More */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Load More
          </button>
        </div>
      )}

      {/* No results */}
      {!loading && polls.length === 0 && (
        <p className="text-center text-slate-400 mt-6">
          No polls found.
        </p>
      )}
    </div>
  );
};

export default BrowsePolls;