"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const AddCardModal = ({ isOpen, onClose, columnId, onAddCard }) => {
  const [formData, setFormData] = useState({
    cardTitle: "",
    priority: "Low",
    description: "",
    job: "",
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get userId from cookies when component mounts
  useEffect(() => {
    try {
      const userCookie = Cookies.get("user");
      if (userCookie) {
        const user = JSON.parse(userCookie);
        setUserId(user.id);
      }
    } catch (error) {
      console.error("Error parsing user cookie:", error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create cardData object to match backend expectation
    const cardData = {
      card_title: formData.cardTitle,
      priority: formData.priority,
      description: formData.description,
      name: formData.name,
      job: formData.job,
    };

    try {
      const response = await axios.post("http://localhost:4000/api/add-card", {
        columnId: columnId,
        cardData: cardData,
        userId: userId,
      });

      if (response.data) {
        // Create a properly formatted card object from the response
        const newCard = {
          id: response.data.cardId,
          title: formData.cardTitle,
          priority: formData.priority,
          description: formData.description,
          name: formData.name,
          job: formData.job,
          column_id: columnId, // Adding column_id for consistency
        };

        // Pass the formatted card to the parent component
        onAddCard(columnId, newCard);

        // Reset form data to empty values
        setFormData({
          cardTitle: "",
          priority: "Low",
          description: "",
          name: "",
          job: "",
        });

        onClose();
      }
    } catch (error) {
      console.error("Error creating card:", error);
      alert("Error creating card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-full">
      <div
        className="fixed inset-0 bg-black/50 w-full h-full backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 animate-modal-in">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Card
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.cardTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cardTitle: e.target.value,
                      }))
                    }
                    placeholder="Enter card title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <input
                    type="text"
                    value={formData.job}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        job: e.target.value,
                      }))
                    }
                    placeholder="Enter job type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter card description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Card"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
