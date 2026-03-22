import React, { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({ onSearchChange, onSortChange }) => {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState("new");

  // 🔥 debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(input);
    }, 400);

    return () => clearTimeout(timer);
  }, [input]);

  // trigger parent search
  useEffect(() => {
    onSearchChange(debounced);
  }, [debounced]);

  const handleSortChange = (e) => {
    setSort(e.target.value);
    onSortChange(e.target.value);
  };

  const clearSearch = () => {
    setInput("");
    setDebounced("");
    onSearchChange("");
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-3 mb-6">
      
      {/* 🔍 Search Input */}
      <div className="flex-1 relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search polls..."
          className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {input && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* 🔽 Sort Dropdown */}
      <select
        value={sort}
        onChange={handleSortChange}
        className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="new">Newest</option>
        <option value="trending">Trending</option>
        <option value="ending">Ending Soon</option>
      </select>
    </div>
  );
};

export default SearchBar;