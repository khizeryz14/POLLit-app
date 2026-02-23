import { useState } from "react";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanOptions = options.filter(o => o.trim() !== "");

    if (!question.trim() || cleanOptions.length < 2) {
      alert("Provide a question and at least two options.");
      return;
    }

    console.log({ question, options: cleanOptions });
    alert("Poll created (mock)");
  };

  return (
      <div className="w-full flex items-center justify-center px-4">      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#181824]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl p-8 text-white animate-[fadeIn_.3s_ease]"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create a Poll
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Ask anything. Let the crowd decide.
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-2">
            Poll Question
          </label>
          <input
            type="text"
            placeholder="Which technology will dominate the next decade?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.01] transition"
          />
        </div>

        {/* Options */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-3">
            Options
          </label>

          <div className="space-y-3">
            {options.map((opt, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(i, e.target.value)
                  }
                  className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:scale-[1.01] focus:ring-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addOption}
            className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            + Add Option
          </button>
        </div>

        {/* Submit */}
        <button
          className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 rounded-xl py-3 text-sm font-medium tracking-wide transition shadow-lg shadow-indigo-500/20 transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-95 hover:scale-[1.02]"
        >
          Create Poll
        </button>
      </form>
    </div>
  );
}