import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const PollContext = createContext();

export function PollProvider({ children }) {

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /* =========================
     Normalize Backend Poll
  ========================== */

  const normalizePoll = (p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image_link || null,
    totalVotes: Number(p.total_votes ?? 0),
    options: p.options || [],
    timeLeft: p.timeLeft,
    expiresAt: p.expires_at,
    username: p.username
  });

  /* =========================
     Fetch Polls (pagination)
  ========================== */

  const fetchPolls = async (pageNum = 1) => {
    try {

      setLoading(true);

      const res = await api.get(`/polls?page=${pageNum}`);

      const rawPolls = res.data.polls || [];

      const newPolls = rawPolls.map(normalizePoll);

      if (pageNum === 1) {
        setPolls(newPolls);
      } else {
        setPolls(prev => [...prev, ...newPolls]);
      }

      setHasMore(res.data.hasMore ?? false);

      setPage(pageNum);

    } catch (err) {
      console.error("Failed to fetch polls", err);
    } finally {
      setLoading(false);
    }
  };

  /* Initial load */

  useEffect(() => {
    fetchPolls(1);
  }, []);

  /* =========================
     Create Poll
  ========================== */

  const createPoll = async (title, options, desc, image) => {
    try {

      const res = await api.post("/polls", {
        title,
        desc,
        options,
        image
      });

      const newPoll = normalizePoll(res.data.poll);

      // optimistic update
      setPolls(prev => [newPoll, ...prev]);

      return newPoll;

    } catch (err) {
      console.error("Poll creation failed", err);
      throw err;
    }
  };

  /* =========================
     Vote Poll (optimistic)
  ========================== */

  const votePoll = async (pollId, optionId) => {

    setPolls(prev =>
      prev.map(poll => {

        if (poll.id !== pollId) return poll;

        return {
          ...poll,
          totalVotes: poll.totalVotes + 1,
          options: poll.options.map(opt =>
            opt.id === optionId
              ? { ...opt, votes: (opt.votes || 0) + 1 }
              : opt
          )
        };

      })
    );

    try {

      await api.post("/votes", {
        pollId,
        optionId
      });

    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  /* =========================
     Get Poll by ID (cache first)
  ========================== */

  const getPollById = async (id) => {

    const existing = polls.find(p => String(p.id) === String(id));

    if (existing) return existing;

    try {

      const res = await api.get(`/polls/${id}`);

      return normalizePoll(res.data.poll);

    } catch (err) {
      console.error("Failed to fetch poll", err);
      return null;
    }
  };

  return (
    <PollContext.Provider
      value={{
        polls,
        loading,
        page,
        hasMore,
        fetchPolls,
        createPoll,
        votePoll,
        getPollById
      }}
    >
      {children}
    </PollContext.Provider>
  );
}

export function usePoll() {
  return useContext(PollContext);
}