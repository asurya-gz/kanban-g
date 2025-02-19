"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import AddBoardModal from "./AddBoardModal";
import EditBoardModal from "./EditBoardModal";

const BoardDropdown = ({
  boards,
  selectedBoard,
  onBoardSelect,
  onBoardsUpdate,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [localBoards, setLocalBoards] = useState(boards);

  useEffect(() => {
    setLocalBoards(boards);
  }, [boards]);

  const handleDeleteBoard = async (boardId) => {
    try {
      const user = JSON.parse(Cookies.get("user"));
      const userId = user.id;

      if (!userId) {
        alert("User ID tidak ditemukan. Silakan login kembali.");
        return;
      }

      if (!boardId) {
        alert("Board ID tidak valid!");
        return;
      }

      const response = await axios.delete(
        "http://localhost:4000/api/delete-userboard",
        {
          data: {
            boardId: boardId,
            userId: userId,
          },
        }
      );

      if (
        response.data.success &&
        response.data.message === "Board berhasil dihapus!"
      ) {
        // Hapus dari state lokal
        const updatedBoards = localBoards.filter(
          (board) => board.id !== boardId
        );
        setLocalBoards(updatedBoards);

        // Reset selected board jika yang dihapus adalah board yang dipilih
        if (selectedBoard?.id === boardId) {
          if (updatedBoards.length > 0) {
            onBoardSelect(updatedBoards[0]);
          } else {
            // Explicitly set to null when no boards remain
            onBoardSelect(null);
            setIsDropdownOpen(false);
          }
        }

        // Fetch data terbaru
        const latestBoards = await fetchLatestBoards();
        setLocalBoards(latestBoards);

        // Update parent component
        await onBoardsUpdate();

        alert("Board berhasil dihapus!");
        window.location.reload();
        setIsDropdownOpen(false);
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Terjadi kesalahan saat menghapus board");
      }
    }
  };

  const openEditModal = (board) => {
    setEditingBoard(board);
    setIsEditModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleBoardUpdate = async () => {
    await onBoardsUpdate();
    const updatedBoards = await fetchLatestBoards();

    if (updatedBoards.length === 0) {
      onBoardSelect(null);
    } else if (selectedBoard?.id === editingBoard?.id) {
      const updatedBoard = updatedBoards.find(
        (board) => board.id === editingBoard.id
      );
      if (updatedBoard) {
        onBoardSelect(updatedBoard);
      }
    }
  };

  const fetchLatestBoards = async () => {
    try {
      const user = JSON.parse(Cookies.get("user"));
      const response = await axios.post(
        "http://localhost:4000/api/all-userboard",
        {
          userId: user.id,
        }
      );

      if (response.data.message === "Berhasil mendapatkan daftar board.") {
        return response.data.boards;
      }
      return [];
    } catch (error) {
      console.error("Error fetching latest boards:", error);
      return [];
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBoard(null);
  };

  return (
    <div className="relative">
      <div
        className="w-64 cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
            <span className="text-gray-700 font-medium">
              {selectedBoard?.board_name || "Select Board"}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 rounded-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Board
              </button>
            </div>
            <ul className="py-2 max-h-60 overflow-y-auto border-t">
              {localBoards.map((board) => (
                <li key={board.id} className="px-3 py-2 hover:bg-blue-50 group">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center flex-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBoardSelect(board);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-gray-700">{board.board_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(board);
                        }}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (board && board.id) {
                            handleDeleteBoard(board.id);
                          } else {
                            alert("Board ID tidak ditemukan!");
                          }
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AddBoardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBoardsUpdate={onBoardsUpdate}
      />

      <EditBoardModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onBoardsUpdate={handleBoardUpdate}
        board={editingBoard}
      />
    </div>
  );
};

export default BoardDropdown;
