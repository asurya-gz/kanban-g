"use client";
import React, { useState, useEffect } from "react";

const WelcomeSplash = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 transition-opacity duration-500">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4 animate-fade-in">Welcome</h1>
        <p className="text-xl animate-fade-in-delay">
          to Development Tasks Board
        </p>
      </div>
    </div>
  );
};

export default WelcomeSplash;
