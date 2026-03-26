import { createContext, useContext, useEffect, useState } from "react";
import { normalizePoll } from "../utils/normalizePoll";
import api from "../api";

const PollContext = createContext();

export function PollProvider({ children }) {

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);


  const fetchPolls = async (params = {}) => {
    try {
      let {
        page: pageNum = 1,
        search = "",
        sort = "new",
        reset = false
      } = params;

      if (typeof params === "number") {
        pageNum = params;
        search = "";
        sort = "new";
        reset = pageNum === 1;
      }

      setLoading(true);

      const query = new URLSearchParams({
        page: pageNum,
        sort,
        ...(search && { search })
      }).toString();

      const res = await api.get(`/polls?${query}`);

      const rawPolls = res.data.polls || [];
      const newPolls = rawPolls.map(normalizePoll);

      if (reset || pageNum === 1) {
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

  //Poll interaction

  const votePoll = async (pollId, optionId) => {

    try {

      const res = await api.post("/votes", {
        pollId,
        optionId
      });

      const updated = res.data.poll;

      setPolls(prev =>
        prev.map(poll => {

          if (poll.id !== pollId) return poll;

          return {
            ...poll,
            hasVoted: true,
            totalVotes: updated.totalVotes,
            options: updated.options 
          };

        })
      );

      return { success: true };

    } catch (err) {

      if (err.response?.status === 400) {
        // already voted → normal UX state
        return { success: false, alreadyVoted: true };
      }

      console.error("Vote failed", err);
      return { success: false };

    }

  };

  const deletePoll = async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);

      // remove from cache
      setPolls(prev => prev.filter(p => p.id !== pollId));

      return { success: true };
    } catch (err) {
      console.error("Delete failed", err);
      return { success: false };
    }
  };

  const updatePoll = async (pollId, data) => {
    try {
      await api.patch(`/polls/${pollId}`, data);

      const res = await api.get(`/polls/${pollId}`);
      const updated = normalizePoll(res.data.poll);

      setPolls(prev =>
        prev.map(p => (p.id === pollId ? updated : p))
      );

      return updated;
    } catch (err) {
      console.error("Update failed", err);
      throw err;
    }
  };

  //Poll fetching

  const getPollById = async (id) => {

    const existing = polls.find(p => String(p.id) === String(id));

    try {

      const res = await api.get(`/polls/${id}`);
      const freshPoll = normalizePoll(res.data.poll);

      // update cache
      setPolls(prev =>
        prev.map(p =>
          String(p.id) === String(id) ? freshPoll : p
        )
      );

      return freshPoll;

    } catch (err) {

      console.error("Failed to fetch poll", err);

      // fallback to cached poll if API fails
      return existing || null;

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
        deletePoll,
        updatePoll,
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