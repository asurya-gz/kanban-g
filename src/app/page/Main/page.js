// app/page.jsx
"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import Navbar from "./components/Navbar";
import BoardColumn from "./components/BoardColumn";
import AddColumnForm from "./components/AddColumnForm";
import TaskDetailModal from "./components/TaskDetailModal";
import WelcomeSplash from "./WelcomeSplash/page";
import EditTaskModal from "./components/EditTaskModal";

const initialBoards = [
  {
    id: "1",
    title: "To Do",
    cards: [
      {
        id: "1",
        title: "Create login page",
        priority: "High",
        job: "Frontend",
        description: "Implement user authentication",
      },
      {
        id: "2",
        title: "Setup database",
        priority: "Medium",
        job: "Backend",
        description: "Configure PostgreSQL",
      },
    ],
  },
  {
    id: "2",
    title: "In Progress",
    cards: [
      {
        id: "3",
        title: "Design system",
        priority: "High",
        job: "Design",
        description: "Create component library",
      },
    ],
  },
  {
    id: "3",
    title: "Done",
    cards: [
      {
        id: "4",
        title: "Project setup",
        priority: "Low",
        job: "DevOps",
        description: "Initialize repository",
      },
    ],
  },
];

const MainPage = () => {
  const [boards, setBoards] = useState(initialBoards);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddColumn = () => {
    setIsAddingColumn(true);
  };

  const handleDeleteCard = (cardId) => {
    setBoards((currentBoards) =>
      currentBoards.map((board) => ({
        ...board,
        cards: board.cards.filter((card) => card.id !== cardId),
      }))
    );
    setSelectedCard(null); // Tutup modal setelah menghapus
  };

  const handleEditCard = (cardId, updatedCard) => {
    setBoards((currentBoards) =>
      currentBoards.map((board) => ({
        ...board,
        cards: board.cards.map((card) =>
          card.id === cardId ? { ...card, ...updatedCard } : card
        ),
      }))
    );
  };

  const handleSaveColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn = {
        id: (boards.length + 1).toString(),
        title: newColumnTitle.trim(),
        cards: [],
      };

      setBoards([...boards, newColumn]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    }
  };

  const handleDeleteColumn = (columnId) => {
    setBoards(boards.filter((board) => board.id !== columnId));
  };

  const handleUpdateColumnTitle = (columnId, newTitle) => {
    setBoards(
      boards.map((board) =>
        board.id === columnId ? { ...board, title: newTitle } : board
      )
    );
  };

  const handleCancelAddColumn = () => {
    setIsAddingColumn(false);
    setNewColumnTitle("");
  };

  const handleCardDragStart = (e, cardId, sourceBoardId) => {
    e.stopPropagation();
    setDraggedItem({ type: "card", cardId, sourceBoardId });
    e.dataTransfer.setData("type", "card");
  };

  const handleColumnDragStart = (e, columnId, columnIndex) => {
    setDraggedItem({ type: "column", columnId, columnIndex });
    e.dataTransfer.setData("type", "column");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetBoardId, targetIndex) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");

    if (!draggedItem) return;

    if (type === "card" && draggedItem.type === "card") {
      const { cardId, sourceBoardId } = draggedItem;
      if (sourceBoardId === targetBoardId) return;

      const newBoards = [...boards];
      const sourceBoard = newBoards.find((b) => b.id === sourceBoardId);
      const targetBoard = newBoards.find((b) => b.id === targetBoardId);

      if (!sourceBoard || !targetBoard) return;

      const cardIndex = sourceBoard.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return;

      const [movedCard] = sourceBoard.cards.splice(cardIndex, 1);
      targetBoard.cards.push(movedCard);

      setBoards(newBoards);
    } else if (type === "column" && draggedItem.type === "column") {
      const { columnIndex } = draggedItem;
      if (columnIndex === targetIndex) return;

      const newBoards = [...boards];
      const [movedColumn] = newBoards.splice(columnIndex, 1);
      newBoards.splice(targetIndex, 0, movedColumn);

      setBoards(newBoards);
    }

    setDraggedItem(null);
  };

  const onAddCard = (columnId, newCard) => {
    setBoards((currentBoards) => {
      return currentBoards.map((board) => {
        if (board.id === columnId) {
          return {
            ...board,
            cards: [...board.cards, newCard],
          };
        }
        return board;
      });
    });
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <WelcomeSplash />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Development Tasks
            </h1>
            <p className="text-sm text-gray-500">Track your team's progress</p>
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
              newColumnTitle={newColumnTitle}
              setNewColumnTitle={setNewColumnTitle}
              onSave={handleSaveColumn}
              onCancel={handleCancelAddColumn}
            />
          )}
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-8">
          {boards.map((board, index) => (
            <BoardColumn
              key={board.id}
              board={board}
              onDragStart={(e) => handleColumnDragStart(e, board.id, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, board.id, index)}
              onCardDragStart={handleCardDragStart}
              onDeleteColumn={handleDeleteColumn}
              onUpdateColumnTitle={handleUpdateColumnTitle}
              onAddCard={onAddCard}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
        {selectedCard && (
          <TaskDetailModal
            isOpen={!!selectedCard}
            onClose={handleCloseModal}
            card={selectedCard}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={() => handleDeleteCard(selectedCard.id)}
          />
        )}
        {isEditModalOpen && selectedCard && (
          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCard(null); // Ini akan menutup detail modal
            }}
            card={selectedCard}
            onSave={handleEditCard}
          />
        )}
      </div>
    </div>
  );
};

export default MainPage;
