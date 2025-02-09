"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

const AddColumnForm = ({
  newColumnTitle,
  setNewColumnTitle,
  onSave,
  onCancel,
}) => {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 opacity-100 animate-modal-in">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Add New Column
            </h3>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="columnTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Column Title
              </label>
              <input
                id="columnTitle"
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 transition-shadow duration-200"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 font-medium"
              >
                Add Column
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modalIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddColumnForm;
