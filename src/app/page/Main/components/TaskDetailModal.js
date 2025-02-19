import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  Hash,
  User,
} from "lucide-react";

const TaskDetailModal = ({ isOpen, onClose, card, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleDeleteCard = async () => {
    if (!card.id) {
      alert("ID kartu tidak valid");
      return;
    }

    try {
      setIsDeleting(true);

      // Periksa kartu terlebih dahulu
      const checkResponse = await axios.post(
        "http://localhost:4000/api/getbyid-card",
        { cardId: card.id }
      );

      if (checkResponse.data.message !== "Berhasil mendapatkan detail kartu.") {
        alert("Tidak dapat menemukan card yang akan dihapus");
        setIsDeleting(false);
        return;
      }

      // Hapus kartu
      const deleteResponse = await axios.delete(
        "http://localhost:4000/api/delete-card",
        {
          data: { cardId: card.id },
        }
      );

      if (deleteResponse.data.message === "Kartu berhasil dihapus!") {
        onClose(); // Tutup modal terlebih dahulu
        await onDelete(card.id); // Refresh data
        setTimeout(() => {
          alert("Card berhasil dihapus!"); // Tampilkan alert setelah data di-refresh
        }, 100);
      } else {
        alert("Gagal menghapus card");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      alert(error.message || "Terjadi kesalahan saat menghapus card");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 ring-red-600/20";
      case "medium":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
      case "low":
        return "bg-green-50 text-green-700 ring-green-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg transform transition-all duration-200 scale-100 opacity-100">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-100">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 leading-6">
                  {card.title}
                </h3>
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                  <Hash className="w-3 h-3 mr-1" />
                  {card.id || "No ID"}
                </span>
              </div>
              <p className="text-sm text-gray-500">Task Details</p>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
                title="Edit"
                disabled={isDeleting}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteCard}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
                title="Close"
                disabled={isDeleting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Tags & Info */}
            <div className="space-y-3">
              {/* Assignee */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{card.name}</span>
              </div>

              {/* Job Tag */}
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  {card.job}
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(
                    card.priority
                  )}`}
                >
                  {card.priority} Priority
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 rounded-b-xl flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
