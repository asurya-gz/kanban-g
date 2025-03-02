"use client";
import React, { useState, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";
import axios from "axios";
import Navbar from "./page/Main/components/Navbar";
import BoardColumn from "./page/Main/components/BoardColumn";
import BoardDropdown from "./page/Main/components/BoardDropdown";
import AddColumnForm from "./page/Main/components/AddColumnForm";
import TaskDetailModal from "./page/Main/components/TaskDetailModal";
import WelcomeSplash from "./page/Main/WelcomeSplash/page";
import EditTaskModal from "./page/Main/components/EditTaskModal";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const MainPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const handleEditCard = async (columnId, cardId, updatedCard) => {
    try {
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

      await fetchBoards();
    } catch (error) {
      console.error("Error updating card:", error);
      alert("Error updating card. Please try again.");
    }
  };

  const handleRefreshColumns = async (deletedCardId) => {
    if (!selectedBoard) return;

    try {
      if (deletedCardId) {
        const updatedColumns = selectedBoard.columns.map((column) => ({
          ...column,
          cards: column.cards.filter((card) => card.id !== deletedCardId),
        }));

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
    } catch (error) {
      console.error("Error updating local state:", error);
    }
  };

  const filterBoardByCurrentUser = (boardData, userId) => {
    if (!boardData || !userId) {
      console.log("Tidak ada data board atau ID pengguna untuk pemfilteran", {
        boardData,
        userId,
      });
      return boardData;
    }

    console.log("Memfilter board untuk ID pengguna:", userId, typeof userId);

    // Pastikan userId adalah angka untuk perbandingan
    const userIdNum = parseInt(userId, 10);

    const filtered = {
      ...boardData,
      columns: boardData.columns.map((column) => {
        const filteredCards = column.cards.filter((card) => {
          console.log(
            `Kartu ${card.id} - user_id: ${
              card.user_id
            } (${typeof card.user_id}) vs currentUserId: ${userIdNum} (${typeof userIdNum})`
          );
          return card.user_id === userIdNum;
        });

        console.log(
          `Kolom ${column.column_name}: ${column.cards.length} kartu → ${filteredCards.length} kartu terfilter`
        );

        return {
          ...column,
          cards: filteredCards,
        };
      }),
    };

    return filtered;
  };

  const fetchMainBoard = async () => {
    try {
      console.log("Memulai fetchMainBoard..."); // Log debug
      const response = await axios.get("http://localhost:4000/api/main-board");
      console.log("Respons API diterima:", response.data); // Log debug

      if (response.data && response.data.board) {
        console.log("Data board valid ditemukan, memperbarui state..."); // Log debug

        // Dapatkan ID pengguna saat ini dari cookies
        const userId = currentUserId;
        console.log("ID pengguna saat ini untuk pemfilteran:", userId); // Ini akan membantu debug

        // Filter data board untuk hanya menyertakan kartu milik pengguna saat ini
        const filteredBoard = filterBoardByCurrentUser(
          response.data.board,
          userId
        );

        // Tambahkan log debug untuk memverifikasi filteredBoard berisi data yang benar
        console.log("Board yang sudah difilter:", filteredBoard);

        setBoards([filteredBoard]);
        setSelectedBoard(filteredBoard);
        console.log(
          "State board berhasil diperbarui dengan kartu yang difilter"
        ); // Log debug
      } else {
        console.error("Data board tidak valid atau hilang:", response.data);
        setBoards([]);
        setSelectedBoard(null);
      }
    } catch (error) {
      console.error("Error di fetchMainBoard:", error.message);
      if (error.response) {
        console.error("Respons error:", error.response.data);
      }
      setBoards([]);
      setSelectedBoard(null);
    }
  };

  // Add this new function
  const fetchBoards = async () => {
    try {
      await fetchMainBoard();
    } catch (error) {
      console.error("Error fetching boards:", error);
      setBoards([]);
      setSelectedBoard(null);
    }
  };

  // Replace handleBoardSelect with GET method
  const handleBoardSelect = async (board) => {
    try {
      const response = await axios.get("http://localhost:4000/api/main-board");

      if (response.data.message === "Berhasil mendapatkan board utama.") {
        // Filter the board data by current user ID
        const filteredBoard = filterBoardByCurrentUser(
          response.data.board,
          currentUserId
        );

        setSelectedBoard(filteredBoard);
        setBoards([filteredBoard]);
      }
    } catch (error) {
      console.error("Error selecting board:", error);
      alert("Terjadi kesalahan saat memilih board");
    }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");
      const user = Cookies.get("user");

      console.log("Auth check - Token:", !!token, "User:", !!user); // Debug log

      if (!token || !user) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        // Parse the user cookie to get the user ID
        try {
          const userData = JSON.parse(user);
          setCurrentUserId(userData.id);
          console.log("Current user ID set to:", userData.id);
        } catch (error) {
          console.error("Error parsing user data from cookie:", error);
        }
      }

      console.log("Calling fetchMainBoard regardless of auth status..."); // Debug log
      await fetchMainBoard(); // Call this regardless of auth status
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Add effect to refetch when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      fetchMainBoard();
    }
  }, [currentUserId]);

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

  // First, let's keep the notification for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <WelcomeSplash />
        <Navbar isViewOnly={true} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6">
              <p className="font-medium">Anda berada dalam mode view only</p>
              <p className="text-sm mt-1">Silahkan login untuk membuat task</p>
            </div>
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
                {/* Hide "Add Column" button in view-only mode */}
              </div>

              <div className="flex space-x-6 overflow-x-auto pb-8">
                {selectedBoard.columns.map((column, index) => (
                  <BoardColumn
                    key={column.id}
                    board={column}
                    onDragStart={(e) => {}} // Empty function to disable dragging
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {}} // Empty function to disable dropping
                    onCardDragStart={() => {}} // Empty function to disable card dragging
                    onDeleteColumn={() => {}} // Empty function to disable column deletion
                    onUpdateColumnTitle={() => {}} // Empty function to disable column title updates
                    onCardClick={handleCardClick} // Allow viewing but not editing
                    onAddCard={() => {}} // Empty function to disable adding cards
                    isViewOnly={true} // Pass view-only flag
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <h2 className="text-xl text-gray-600">No boards available.</h2>
            </div>
          )}

          {selectedCard && (
            <TaskDetailModal
              isOpen={!!selectedCard}
              onClose={handleCloseModal}
              card={selectedCard}
              onEdit={() => {}} // Disable editing
              onDelete={() => {}} // Disable deletion
              isViewOnly={true}
            />
          )}
        </div>
      </div>
    );
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
        // Get filtered columns with only current user's cards
        const filteredColumns = response.data.columns.map((column) => ({
          ...column,
          cards: (
            prevBoard.columns.find((c) => c.id === column.id)?.cards || []
          ).filter((card) => card.user_id === currentUserId),
        }));

        // Update selectedBoard with filtered data
        setSelectedBoard((prevBoard) => ({
          ...prevBoard,
          columns: filteredColumns,
        }));

        // Update boards state
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.id === selectedBoard.id
              ? {
                  ...board,
                  columns: filteredColumns,
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
      <Navbar isViewOnly={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
