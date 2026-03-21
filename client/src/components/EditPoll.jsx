import React, { useState } from "react";

const EditPoll = ({ poll, onSave, onCancel }) => {

  const [form, setForm] = useState({
    title: poll.title,
    description: poll.description || "",
    image: poll.image || "",
    options: poll.options.map(o => o.text)
  });

  const handleOptionChange = (i, value) => {
    const updated = [...form.options];
    updated[i] = value;
    setForm({ ...form, options: updated });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return alert("Title required");

    const cleanOptions = form.options.filter(o => o.trim() !== "");
    if (cleanOptions.length < 2) {
      return alert("At least 2 options required");
    }

    onSave(form);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">

        <h2 className="text-xl font-semibold text-white">
          Edit Poll
        </h2>

        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-slate-800 p-3 rounded-lg"
        />

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full bg-slate-800 p-3 rounded-lg"
        />

        <input
          value={form.image}
          onChange={(e) =>
            setForm({ ...form, image: e.target.value })
          }
          className="w-full bg-slate-800 p-3 rounded-lg"
        />

        {form.options.map((opt, i) => (
          <input
            key={i}
            value={opt}
            onChange={(e) =>
              handleOptionChange(i, e.target.value)
            }
            className="w-full bg-slate-800 p-3 rounded-lg"
          />
        ))}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 px-4 py-2 rounded-lg"
          >
            Save
          </button>

          <button
            onClick={onCancel}
            className="text-slate-400"
          >
            Cancel
          </button>
        </div>

      </div>

    </div>
  );
};

export default EditPoll;