import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import api from "../api";
import PollGrid from "../components/PollGrid";
import UserInfo from "../components/UserInfo";
import { normalizePoll } from "../utils/normalizePoll";

const Profile = () => {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);

  const [userLoading, setUserLoading] = useState(true);
  const [pollsLoading, setPollsLoading] = useState(true);

  const [pollError, setPollError] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /* 🔹 FETCH USER */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/user/${username}`);
        setUser(res.data.user);
      } catch (err) {
        console.error("User fetch error:", err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  /* 🔹 FETCH POLLS (paginated) */
  const fetchUserPolls = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setPollsLoading(true);

      const res = await api.get(
        `/polls/user/${username}?page=${pageNum}`
      );

      const normalized = res.data.polls.map(normalizePoll);

      if (reset || pageNum === 1) {
        setPolls(normalized);
      } else {
        setPolls(prev => [...prev, ...normalized]);
      }

      setHasMore(res.data.hasMore ?? false);
      setPage(pageNum);

    } catch (err) {
      console.error("Poll fetch error:", err);
      setPollError(true);
    } finally {
      setPollsLoading(false);
    }
  };

  /* 🔹 INITIAL LOAD */
  useEffect(() => {
    fetchUserPolls(1, true);
  }, [username]);

  /* 🔹 LOAD MORE */
  const handleLoadMore = () => {
    fetchUserPolls(page + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

      {/* 👤 USER INFO */}
      {userLoading ? (
        <div className="animate-pulse bg-slate-900/60 border border-slate-800 rounded-xl p-6 h-24" />
      ) : (
        <UserInfo user={user} />
      )}

      {/* 📊 USER POLLS */}
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">
            All Polls
          </h3>
        </div>

        {pollsLoading && polls.length === 0 ? (
          <p className="text-slate-400">Loading polls...</p>
        ) : pollError ? (
          <p className="text-red-400">Failed to load polls</p>
        ) : polls.length === 0 ? (
          <p className="text-slate-400">No polls yet.</p>
        ) : (
          <PollGrid polls={polls} />
        )}

        {/* 🔄 LOAD MORE */}
        {!pollsLoading && hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              className="
                flex items-center gap-2
                px-6 py-2 rounded-xl
                bg-indigo-600 hover:bg-indigo-500
                transition
              "
            >
              Load More <FiArrowRight />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default Profile;