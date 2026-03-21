import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiClock,
  FiCheck,
  FiUser,
  FiTrash2,
  FiEdit
} from "react-icons/fi";

import { usePoll } from "../context/PollContext";
import { useAuth } from "../context/AuthContext";

import EditPoll from "../components/EditPoll";
import ConfirmDialog from "../components/ConfirmDialog";

import defaultImage from "../assets/defaultPoll.jpg";

const PollView = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();

  const { getPollById, votePoll, deletePoll, updatePoll } = usePoll();
  const { user } = useAuth();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* =========================
     Load Poll
  ========================== */

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPollById(pollId);
      setPoll(data);
      setLoading(false);
    };
    load();
  }, [pollId]);

  /* =========================
     Animate bars
  ========================== */

  useEffect(() => {
    if (poll?.hasVoted) {
      setAnimateBars(false);
      setTimeout(() => setAnimateBars(true), 50);
    }
  }, [poll]);

  /* =========================
     Ownership
  ========================== */

  const isOwner = user && poll && user.id === poll.userId;
  const canEdit = isOwner && poll?.totalVotes === 0;

  /* =========================
     Vote
  ========================== */

  const handleVote = async (optionId) => {
    if (!poll || poll.hasVoted || isVoting) return;

    setIsVoting(true);

    const res = await votePoll(poll.id, optionId);

    if (!res?.success && !res?.alreadyVoted) {
      setIsVoting(false);
      return;
    }

    const updated = await getPollById(poll.id);

    setSelected(optionId);
    setPoll(updated);
    setIsVoting(false);
  };

  /* =========================
     Delete
  ========================== */

  const handleDelete = async () => {
    const res = await deletePoll(poll.id);

    if (res.success) {
      navigate("/");
    } else {
      console.error("Delete failed");
    }
  };

  /* =========================
     Update
  ========================== */

  const handleUpdate = async (data) => {
    try {
      const updated = await updatePoll(poll.id, data);
      setPoll(updated);
      setIsEditing(false);
    } catch {
      console.error("Update failed");
    }
  };

  /* =========================
     UI States
  ========================== */

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-slate-400">
        Loading poll...
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-red-400">
        Poll not found
      </div>
    );
  }

  /* =========================
     Edit Mode
  ========================== */

  if (isEditing) {
    return (
      <EditPoll
        poll={poll}
        onSave={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  /* =========================
     Derived
  ========================== */

  const pollImage = poll.image || defaultImage;
  const totalVotes = poll.totalVotes || 0;
  const hasVoted = poll.hasVoted;

  const getPercent = (votes) => {
    if (!totalVotes) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  /* =========================
     Render
  ========================== */

  return (
    <div className="max-w-3xl mx-auto p-6">

      <div className="
        bg-slate-900/70
        backdrop-blur-md
        border border-slate-700/50
        rounded-2xl
        shadow-xl
        p-6
      ">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-4">

          {/* USER */}
          <div className="flex items-center gap-2">
            <FiUser className="text-indigo-400" />
            <Link
              to={`/user/${poll.username}`}
              className="text-slate-300 hover:text-indigo-300 transition text-sm"
            >
              {poll.username}
            </Link>
          </div>

          {/* ACTIONS */}
          {isOwner && (
            <div className="flex items-center gap-2">

              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    w-10 h-10 flex items-center justify-center
                    rounded-lg
                    bg-indigo-600/20 text-indigo-400
                    hover:bg-indigo-500/30 hover:text-indigo-300
                    border border-indigo-500/20
                    transition-all duration-200
                    hover:scale-105 active:scale-95
                  "
                >
                  <FiEdit size={18} />
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-lg
                  bg-red-600/20 text-red-400
                  hover:bg-red-500/30 hover:text-red-300
                  border border-red-500/20
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                "
              >
                <FiTrash2 size={18} />
              </button>

            </div>
          )}

        </div>

        {/* IMAGE */}
        <div className="h-56 w-full overflow-hidden rounded-xl mb-6">
          <img
            src={pollImage}
            alt="Poll"
            className="w-full h-full object-cover"
          />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold mb-2">
          {poll.title}
        </h1>

        {/* DESCRIPTION */}
        <p className="text-slate-400 mb-6">
          {poll.description || "No description provided"}
        </p>

        {/* OPTIONS */}
        <div className="space-y-3 mb-6">

          {poll.options.map(option => {

            const percent = getPercent(option.votes);
            const isSelected = selected === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isVoting}
                className={`
                  relative w-full text-left
                  bg-slate-800/70 border border-slate-700
                  rounded-lg px-4 py-3 text-slate-300
                  overflow-hidden
                  transition-all duration-200
                  ${!hasVoted ? "hover:bg-indigo-600/20 hover:border-indigo-500/30 hover:scale-[1.01] active:scale-95" : ""}
                  ${isSelected && hasVoted ? "border-emerald-400/40 bg-emerald-500/10" : ""}
                `}
              >

                {/* BAR */}
                <div
                  className="
                    absolute inset-y-0 left-0
                    bg-gradient-to-r from-indigo-500/50 to-indigo-400/30
                    transition-all duration-700 ease-out
                    rounded-lg
                  "
                  style={{
                    width:
                      hasVoted && animateBars
                        ? `${percent}%`
                        : "0%"
                  }}
                />

                {/* CONTENT */}
                <div className="relative flex items-center justify-between">

                  <span className="flex items-center gap-2">
                    {isSelected && hasVoted && (
                      <FiCheck className="text-emerald-400" />
                    )}
                    {option.text}
                  </span>

                  <span className="text-sm w-10 text-right text-indigo-300 font-medium">
                    {hasVoted ? `${percent}%` : ""}
                  </span>

                </div>

              </button>
            );
          })}

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between text-sm text-slate-500">

          <span>{totalVotes} votes</span>

          <div className="flex items-center gap-1">
            <FiClock />
            <span>{poll.timeLeft || "Active"}</span>
          </div>

        </div>

      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div>
          <ConfirmDialog
            title="Delete Poll"
            message="This poll will be permanently deleted. This action cannot be undone."
            confirmText="Delete"
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={() => {
              setShowDeleteModal(false);
              handleDelete();
            }}
          />
        </div>
      )}

    </div>
  );
};

export default PollView;