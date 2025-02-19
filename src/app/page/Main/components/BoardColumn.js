"use client";
import React, { useState, useRef, useEffect } from "react";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import AddCardModal from "./AddCardModal";
import axios from "axios";

const BoardColumn = ({
  board,
  onDragStart,
  onDragOver,
  onDrop,
  onCardDragStart,
  onDeleteColumn,
  onAddCard,
  onUpdateColumnTitle,
  onCardClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localColumnTitle, setLocalColumnTitle] = useState(
    board.column_name || ""
  );
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalColumnTitle(board.column_name || "");
  }, [board.column_name]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const updateColumnTitle = async (columnId, newTitle) => {
    if (!columnId || !newTitle.trim()) {
      alert("Judul kolom tidak boleh kosong!");
      return false;
    }

    try {
      // Optimistic update - update UI first
      onUpdateColumnTitle({
        ...board,
        column_name: newTitle.trim(),
      });

      const response = await axios.put(
        "http://localhost:4000/api/update-column",
        {
          columnId: columnId,
          columnName: newTitle.trim(),
        }
      );

      if (response.data.success) {
        return true;
      }

      // If API call fails, revert the changes
      onUpdateColumnTitle({
        ...board,
        column_name: board.column_name,
      });
      return false;
    } catch (error) {
      console.error("Error updating column title:", error);
      // Revert changes on error
      onUpdateColumnTitle({
        ...board,
        column_name: board.column_name,
      });
      alert("Terjadi kesalahan saat memperbarui judul kolom");
      return false;
    }
  };

  const handleTitleUpdate = async () => {
    if (!localColumnTitle.trim()) {
      alert("Judul kolom tidak boleh kosong!");
      setLocalColumnTitle(board.column_name);
      setIsEditing(false);
      return;
    }

    if (localColumnTitle.trim() === board.column_name) {
      setIsEditing(false);
      return;
    }

    const success = await updateColumnTitle(board.id, localColumnTitle.trim());

    if (!success) {
      setLocalColumnTitle(board.column_name);
    } else {
      setLocalColumnTitle(localColumnTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleTitleUpdate();
    } else if (e.key === "Escape") {
      setLocalColumnTitle(board.column_name);
      setIsEditing(false);
    }
  };

  const handleBlur = async () => {
    await handleTitleUpdate();
  };

  const handleAddCard = (columnId, newCard) => {
    // Update the local column state with the new card
    const updatedCards = [...board.cards, newCard];

    // Pass the updated card data to the parent component
    onAddCard(columnId, newCard);
  };

  return (
    <>
      <div
        className="flex-shrink-0 w-80 text-gray-600"
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="bg-white rounded-t-xl p-3 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-2">
              {isEditing ? (
                <div className="animate-fade-in">
                  <input
                    ref={inputRef}
                    type="text"
                    value={localColumnTitle}
                    onChange={(e) => setLocalColumnTitle(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-1.5 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 font-medium bg-blue-50/50"
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className="font-medium text-gray-900 cursor-pointer group flex items-center py-1.5 px-3 -ml-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <span>{localColumnTitle}</span>
                  <Edit2 className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-48 py-1 z-50 animate-menu-in"
                >
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Column
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Column
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-lg rounded-b-xl p-3 space-y-3 min-h-[200px] border-x border-b border-gray-200">
          {board.cards?.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              onDragStart={(e) => onCardDragStart(e, card.id, board.id)}
              onClick={() => onCardClick(card)}
            />
          ))}

          <button
            onClick={() => setShowAddCard(true)}
            className="w-full p-2 text-gray-600 hover:text-gray-900 text-sm flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDeleteColumn(board.id);
          setShowDeleteModal(false);
        }}
        columnTitle={localColumnTitle}
      />

      <AddCardModal
        isOpen={showAddCard}
        onClose={() => setShowAddCard(false)}
        onSubmit={handleAddCard}
        columnId={board.id} // Pass the current column's ID
        initialData={{
          title: "",
          description: "",
          priority: "Low",
          job: "",
        }}
        onAddCard={onAddCard}
      />

      <style jsx>{`
        @keyframes menuIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-menu-in {
          animation: menuIn 0.2s ease-out forwards;
        }

        .animate-modal-in {
          animation: modalIn 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default BoardColumn;
