"use client";
import React, { useState, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";
import axios from "axios";
import Navbar from "./components/Navbar";
import BoardColumn from "./components/BoardColumn";
import BoardDropdown from "./components/BoardDropdown";
import AddColumnForm from "./components/AddColumnForm";
import TaskDetailModal from "./components/TaskDetailModal";
import WelcomeSplash from "./WelcomeSplash/page";
import EditTaskModal from "./components/EditTaskModal";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const MainPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch boards data using axios
  const fetchBoards = async () => {
    try {
      const user = JSON.parse(Cookies.get("user"));
      const userId = user.id;

      const response = await axios.post(
        "http://localhost:4000/api/all-userboard",
        {
          userId: userId,
        }
      );

      const data = response.data;

      if (data.message === "Berhasil mendapatkan daftar board.") {
        setBoards(data.boards);

        // Update selectedBoard handling
        if (data.boards.length === 0) {
          setSelectedBoard(null);
        } else if (selectedBoard) {
          const updatedSelectedBoard = data.boards.find(
            (board) => board.id === selectedBoard.id
          );
          if (updatedSelectedBoard) {
            setSelectedBoard(updatedSelectedBoard);
          } else {
            // If current selected board no longer exists, select the first available board
            setSelectedBoard(data.boards[0]);
          }
        } else if (data.boards.length > 0) {
          setSelectedBoard(data.boards[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
      setBoards([]);
      setSelectedBoard(null);
    }
  };

  const handleBoardSelect = async (board) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/all-userboard",
        {
          userId: JSON.parse(Cookies.get("user")).id,
        }
      );

      if (response.data.message === "Berhasil mendapatkan daftar board.") {
        const updatedBoard = response.data.boards.find(
          (b) => b.id === board.id
        );
        if (updatedBoard) {
          setSelectedBoard(updatedBoard);
          setBoards(response.data.boards);
        }
      }
    } catch (error) {
      console.error("Error selecting board:", error);
      alert("Terjadi kesalahan saat memilih board");
    }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token");
      const user = Cookies.get("user");

      if (!token || !user) {
        router.push("/page/Logout");
        return;
      }

      fetchBoards();
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".board-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleAddColumn = () => {
    setIsAddingColumn(true);
  };

  const handleRefreshAddCard = async (columnId, newCard) => {
    if (!selectedBoard) return;

    if (newCard) {
      // Update the selectedBoard state with the new card
      const updatedColumns = selectedBoard.columns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            cards: [...column.cards, newCard],
          };
        }
        return column;
      });

      // Update both selectedBoard and boards states
      setSelectedBoard((prev) => ({
        ...prev,
        columns: updatedColumns,
      }));

      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === selectedBoard.id
            ? { ...board, columns: updatedColumns }
            : board
        )
      );
    }
  };

  const handleRefreshColumns = async (deletedCardId) => {
    if (!selectedBoard) return;

    try {
      // Hanya update local state untuk UX yang lebih baik
      if (deletedCardId) {
        const updatedColumns = selectedBoard.columns.map((column) => ({
          ...column,
          cards: column.cards.filter((card) => card.id !== deletedCardId),
        }));

        setSelectedBoard((prev) => ({
          ...prev,
          columns: updatedColumns,
        }));

        // Update boards state juga untuk menjaga konsistensi
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.id === selectedBoard.id
              ? { ...board, columns: updatedColumns }
              : board
          )
        );
      }
    } catch (error) {
      console.error("Error updating local state:", error);
    }
  };

  const handleEditCard = async (columnId, cardId, updatedCard) => {
    try {
      // Update local state first
      const updatedColumns = selectedBoard.columns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            cards: column.cards.map((card) =>
              card.id === cardId ? { ...card, ...updatedCard } : card
            ),
          };
        }
        return column;
      });

      // Update selectedBoard state
      setSelectedBoard((prev) => ({
        ...prev,
        columns: updatedColumns,
      }));

      // Update boards state
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === selectedBoard.id
            ? { ...board, columns: updatedColumns }
            : board
        )
      );

      // Fetch fresh data from server
      await fetchBoards();
    } catch (error) {
      console.error("Error updating card:", error);
      alert("Error updating card. Please try again.");
    }
  };

  const handleSaveColumn = async (responseData) => {
    if (!selectedBoard) return;

    try {
      // Gunakan data dari response AddColumnForm
      const newColumn = {
        id: responseData.columnId,
        column_name: newColumnTitle.trim(),
        position: responseData.position,
        cards: [], // Inisialisasi cards kosong untuk kolom baru
      };

      // Update selectedBoard dengan kolom baru
      setSelectedBoard({
        ...selectedBoard,
        columns: [...selectedBoard.columns, newColumn],
      });

      // Reset state
      setNewColumnTitle("");
      setIsAddingColumn(false);

      // Optional: Refresh boards data
      await fetchBoards();
    } catch (error) {
      console.error("Error updating board with new column:", error);
      alert("Terjadi kesalahan saat memperbarui board");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      const response = await axios.delete(
        "http://localhost:4000/api/delete-column",
        {
          data: {
            columnId: columnId,
          },
        }
      );

      // Periksa response.data dan status
      if (response.data && response.status === 200) {
        if (selectedBoard) {
          // Filter out the deleted column from the selected board
          const updatedColumns = selectedBoard.columns.filter(
            (column) => column.id !== columnId
          );

          // Update the selectedBoard state
          const updatedSelectedBoard = {
            ...selectedBoard,
            columns: updatedColumns,
          };

          // Update the boards state to reflect the change in all places
          const updatedBoards = boards.map((board) =>
            board.id === selectedBoard.id ? updatedSelectedBoard : board
          );

          // Update both states
          setSelectedBoard(updatedSelectedBoard);
          setBoards(updatedBoards);

          // Show success message
          alert("Column berhasil dihapus!");
        }
      } else {
        // Jika response ada tapi bukan success
        console.error("Server response:", response.data);
        alert(response.data.message || "Gagal menghapus column");
      }
    } catch (error) {
      // Tangani network error atau error lainnya
      console.error("Error deleting column:", error);
      alert("Terjadi kesalahan saat menghapus column");
    }
  };

  const handleUpdateColumnTitle = async (updatedColumn) => {
    try {
      // Optimistic update untuk UI
      setSelectedBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.map((column) =>
          column.id === updatedColumn.id ? updatedColumn : column
        ),
      }));

      // Fetch data terbaru dari server
      const response = await axios.post(
        "http://localhost:4000/api/getbyid-column",
        {
          boardId: selectedBoard.id,
        }
      );

      if (response.data.message === "Berhasil mendapatkan daftar kolom.") {
        // Update selectedBoard dengan data terbaru dari server
        setSelectedBoard((prevBoard) => ({
          ...prevBoard,
          columns: response.data.columns.map((column) => ({
            ...column,
            cards:
              prevBoard.columns.find((c) => c.id === column.id)?.cards || [],
          })),
        }));

        // Update boards state
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.id === selectedBoard.id
              ? {
                  ...board,
                  columns: response.data.columns.map((column) => ({
                    ...column,
                    cards:
                      board.columns.find((c) => c.id === column.id)?.cards ||
                      [],
                  })),
                }
              : board
          )
        );
      }
    } catch (error) {
      console.error("Error refreshing column data:", error);
      // Revert optimistic update jika terjadi error
      setSelectedBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.map((column) =>
          column.id === updatedColumn.id
            ? { ...column, column_name: column.column_name }
            : column
        ),
      }));
      alert("Terjadi kesalahan saat memperbarui data kolom");
    }
  };

  const handleCardDragStart = (e, cardId, sourceColumnId) => {
    e.stopPropagation();
    setDraggedItem({ type: "card", cardId, sourceColumnId });
    e.dataTransfer.setData("type", "card");
  };

  const handleColumnDragStart = (e, columnId, columnIndex) => {
    setDraggedItem({ type: "column", columnId, columnIndex });
    e.dataTransfer.setData("type", "column");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Updated handleDrop function for MainPage.js
  const handleDrop = async (e, targetColumnId, targetIndex) => {
    e.preventDefault();
    if (!selectedBoard || !draggedItem) return;

    const type = e.dataTransfer.getData("type");

    if (type === "card" && draggedItem.type === "card") {
      const { cardId, sourceColumnId } = draggedItem;
      if (sourceColumnId === targetColumnId) return;

      try {
        // Optimistic update for UI
        const updatedColumns = selectedBoard.columns.map((column) => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              cards: column.cards.filter((card) => card.id !== cardId),
            };
          }
          if (column.id === targetColumnId) {
            const movedCard = selectedBoard.columns
              .find((col) => col.id === sourceColumnId)
              .cards.find((card) => card.id === cardId);

            const updatedCard = {
              ...movedCard,
              column_id: targetColumnId,
              position: targetIndex,
            };

            return {
              ...column,
              cards: [...column.cards, updatedCard],
            };
          }
          return column;
        });

        // Update local state immediately
        setSelectedBoard({
          ...selectedBoard,
          columns: updatedColumns,
        });

        // Make API call with the structure matching your controller
        const response = await axios.put(
          "http://localhost:4000/api/update-card-position",
          {
            cardId: cardId,
            newColumnId: targetColumnId,
            newPosition: targetIndex,
          }
        );

        if (response.status === 200) {
          // Refresh the board to get the latest state
          await fetchBoards();
        } else {
          throw new Error(response.data.message || "Failed to move card");
        }
      } catch (error) {
        console.error("Error moving card:", error);
        alert(
          error.response?.data?.message ||
            "Terjadi kesalahan saat memindahkan card"
        );
        // Refresh board to ensure consistency
        await fetchBoards();
      }
    }

    setDraggedItem(null);
  };

  // Add this function to handle position updates within the same column
  const handleSameColumnDrop = async (e, columnId, targetIndex) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.sourceColumnId !== columnId) return;

    const { cardId } = draggedItem;

    try {
      // Get current cards in the column
      const currentColumn = selectedBoard.columns.find(
        (col) => col.id === columnId
      );
      const cards = [...currentColumn.cards];
      const movedCard = cards.find((card) => card.id === cardId);

      // Remove card from current position
      const filteredCards = cards.filter((card) => card.id !== cardId);

      // Insert card at new position
      filteredCards.splice(targetIndex, 0, movedCard);

      // Update positions
      const updatedCards = filteredCards.map((card, index) => ({
        ...card,
        position: index,
      }));

      // Optimistic update
      const updatedColumns = selectedBoard.columns.map((col) =>
        col.id === columnId ? { ...col, cards: updatedCards } : col
      );

      setSelectedBoard({
        ...selectedBoard,
        columns: updatedColumns,
      });

      // API call to update position
      await axios.put("http://localhost:4000/api/update-card-position", {
        cardId: cardId,
        newColumnId: columnId,
        newPosition: targetIndex,
      });
    } catch (error) {
      console.error("Error reordering card:", error);
      alert("Terjadi kesalahan saat mengatur ulang posisi card");
      await fetchBoards();
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const updateBoardState = (boardId, updatedData) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId ? { ...board, ...updatedData } : board
      )
    );

    if (selectedBoard?.id === boardId) {
      setSelectedBoard((prev) => ({ ...prev, ...updatedData }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <WelcomeSplash />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BoardDropdown
            boards={boards}
            selectedBoard={selectedBoard}
            onBoardSelect={handleBoardSelect}
            onBoardsUpdate={fetchBoards}
          />
        </div>

        {selectedBoard ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedBoard.board_name}
                </h1>
                <p className="text-sm text-gray-500">
                  Track your team's progress
                </p>
              </div>
              {!isAddingColumn ? (
                <button
                  onClick={handleAddColumn}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </button>
              ) : (
                <AddColumnForm
                  board={selectedBoard}
                  newColumnTitle={newColumnTitle}
                  setNewColumnTitle={setNewColumnTitle}
                  onSave={handleSaveColumn}
                  onCancel={() => setIsAddingColumn(false)}
                />
              )}
            </div>

            <div className="flex space-x-6 overflow-x-auto pb-8">
              {selectedBoard.columns.map((column, index) => (
                <BoardColumn
                  key={column.id}
                  board={column}
                  onDragStart={(e) =>
                    handleColumnDragStart(e, column.id, index)
                  }
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id, index)}
                  onCardDragStart={handleCardDragStart}
                  onDeleteColumn={handleDeleteColumn}
                  onUpdateColumnTitle={handleUpdateColumnTitle}
                  onCardClick={handleCardClick}
                  onAddCard={handleRefreshAddCard}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-xl text-gray-600">
              No boards available. Create a new board to get started.
            </h2>
          </div>
        )}

        {selectedCard && (
          <TaskDetailModal
            isOpen={!!selectedCard}
            onClose={handleCloseModal}
            card={selectedCard}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={handleRefreshColumns}
          />
        )}

        {isEditModalOpen && selectedCard && (
          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCard(null);
            }}
            card={selectedCard}
            onSave={handleEditCard} // Updated to use handleEditCard
          />
        )}
      </div>
    </div>
  );
};

export default MainPage;
