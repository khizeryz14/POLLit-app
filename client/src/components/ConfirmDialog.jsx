import React from "react";

const ConfirmDialog = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel
}) => {
  return (
    <div className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/50 backdrop-blur-sm
      animate-[fadeIn_0.15s_ease]
    ">

      <div className="
        bg-slate-900
        border border-slate-800
        rounded-2xl
        p-6
        w-full max-w-sm
        shadow-xl
      ">

        <h2 className="text-lg font-semibold text-white mb-2">
          {title}
        </h2>

        <p className="text-slate-400 text-sm mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="
              px-4 py-2
              rounded-lg
              text-slate-400
              hover:text-white
              transition
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="
              px-4 py-2
              rounded-lg
              bg-red-600
              hover:bg-red-500
              text-white
              transition
            "
          >
            {confirmText}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ConfirmDialog;