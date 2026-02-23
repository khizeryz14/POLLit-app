import { createContext, useContext, useEffect, useState } from "react";

const PollContext = createContext();

const defaultPolls = [
  {
    id: 1,
    question: "Which stack do you prefer?",
    image: "/assets/defaultPoll.jpg",
    options: [
      { id: 1, text: "MERN", votes: 4 },
      { id: 2, text: "PERN", votes: 2 },
    ],
  },
];

export function PollProvider({ children }) {
  const [polls, setPolls] = useState([]);

  /* Load from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("pollit_polls");
    if (stored) {
      setPolls(JSON.parse(stored));
    } else {
      setPolls(defaultPolls);
    }
  }, []);

  /* Persist */
  useEffect(() => {
    localStorage.setItem("pollit_polls", JSON.stringify(polls));
  }, [polls]);

  const createPoll = (question, options, image) => {
    const newPoll = {
      id: Date.now(),
      question,
      image: image || "/assets/defaultPoll.jpg",
      options: options.map((text, i) => ({
        id: i + 1,
        text,
        votes: 0,
      })),
    };

    setPolls(prev => [newPoll, ...prev]);
  };

  const votePoll = (pollId, optionId) => {
    setPolls(prev =>
      prev.map(poll => {
        if (poll.id !== pollId) return poll;

        return {
          ...poll,
          options: poll.options.map(opt =>
            opt.id === optionId
              ? { ...opt, votes: opt.votes + 1 }
              : opt
          ),
        };
      })
    );
  };

  const getPollById = (id) => {
    return polls.find(p => String(p.id) === String(id));
  };

  return (
    <PollContext.Provider value={{ polls, createPoll, votePoll, getPollById }}>
      {children}
    </PollContext.Provider>
  );
}

export function usePolls() {
  return useContext(PollContext);
}