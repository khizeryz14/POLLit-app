import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    // 🔹 Fetch USER (fast, priority)
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

    // 🔹 Fetch POLLS (secondary)
    const fetchPolls = async () => {
      try {
        const res = await api.get(`/polls/user/${username}`);
        const normalizedPolls = res.data.polls.map(normalizePoll);
        setPolls(normalizedPolls.slice(0, 3));
      } catch (err) {
        console.error("Poll fetch error:", err);
        setPollError(true);
      } finally {
        setPollsLoading(false);
      }
    };

    fetchUser();
    fetchPolls();
  }, [username]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

      {/* ✅ USER INFO (loads first) */}
      {userLoading ? (
        <div className="animate-pulse bg-slate-900/60 border border-slate-800 rounded-xl p-6 h-24" />
      ) : (
        <UserInfo user={user} />
      )}

      {/* ✅ POLLS SECTION */}
      <div className= "max-w-6xl mx-auto px-6 py-10 space-y-8">
        <h3 className="text-md font-semibold text-slate-300 mb-4">
          Recent Polls
        </h3>

        {pollsLoading ? (
          <p className="text-slate-400">Loading polls...</p>
        ) : pollError ? (
          <p className="text-red-400">Failed to load polls</p>
        ) : (
          <PollGrid polls={polls} />
        )}
      </div>

    </div>
  );
};

export default Profile;