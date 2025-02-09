import React from "react";
import { Hash } from "lucide-react";

const TaskCard = ({ card, onDragStart, onClick }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{card.title}</h4>
            <span className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md ring-1 ring-inset ring-gray-200">
              <Hash className="w-3 h-3 mr-0.5" />
              {card.id || "No ID"}
            </span>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            card.priority === "High"
              ? "bg-red-100 text-red-800"
              : card.priority === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {card.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{card.description}</p>
      <div className="flex items-center">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-lg">
          {card.job}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
