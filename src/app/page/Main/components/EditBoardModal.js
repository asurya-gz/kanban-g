import React from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Add this import

const EditBoardModal = ({ isOpen, onClose, onBoardsUpdate, board }) => {
  const [newBoardName, setNewBoardName] = React.useState(
    board?.board_name || ""
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (board) {
      setNewBoardName(board.board_name);
    }
  }, [board]);

  const handleEditBoard = async () => {
    if (!newBoardName.trim()) {
      setError("Board name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = JSON.parse(Cookies.get("user")); // Get user from cookies
      const response = await axios.put(
        `http://localhost:4000/api/update-userboard`,
        {
          userId: user.id,
          boardId: board.id, // Add boardId from props
          boardName: newBoardName.trim(),
        }
      );

      if (response.data.success) {
        alert("Board successfully updated!");
        onBoardsUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error updating board:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update board. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleEditBoard();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Edit Board
          </h3>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => {
                  setNewBoardName(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter new board name"
                className={`w-full px-3 py-2 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isLoading}
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditBoard}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium text-white ${
                  isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBoardModal;
