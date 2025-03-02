"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const EditTaskModal = ({ isOpen, onClose, card, onSave }) => {
  const [formData, setFormData] = useState({
    id: card.id,
    title: card.title,
    description: card.description,
    priority: card.priority,
    job: card.job,
    name: card.name,
    column_id: card.column_id,
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

    // Adjusted payload to match what the controller expects
    const payload = {
      cardId: formData.id,
      cardData: {
        card_title: formData.title,
        priority: formData.priority,
        description: formData.description,
        name: formData.name,
        job: formData.job,
      },
      userId: userId,
    };

    try {
      const response = await axios.put(
        "http://localhost:4000/api/update-card",
        payload
      );

      if (response.status === 200) {
        // Create updated card object with all required properties
        const updatedCard = {
          ...card, // Keep all original properties
          id: formData.id,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          job: formData.job,
          name: formData.name,
          column_id: formData.column_id,
        };

        // Call onSave with the complete data
        await onSave(formData.column_id, formData.id, updatedCard);

        // Wait briefly before closing modal
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Task</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <input
                      type="text"
                      name="job"
                      value={formData.job}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      rows="12"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 rounded-b-xl flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
