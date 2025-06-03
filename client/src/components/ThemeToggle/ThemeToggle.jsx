import React, { useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = ({ theme, setTheme }) => {
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    if (diff > 50) {
      setTheme("light");
    } else if (diff < -50) {
      setTheme("dark");
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`mt-3 text-xs text-center cursor-pointer ${
        theme === "dark" ? "text-gray-100" : "text-gray-900"
      } opacity-85 transition-colors duration-300 ease-in-out flex items-center justify-center gap-2`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setTheme(theme === "light" ? "dark" : "light");
        }}
        className={`${
          theme === "light" ? "bg-gray-900" : "bg-gray-100"
        } ${theme === "light" ? "text-white" : "text-gray-900"} py-2 px-4 rounded-full border-2 border-gray-400 cursor-pointer text-xs font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out`}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor =
            theme === "light" ? "#444" : "#e1e1e1";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor =
            theme === "light" ? "#222" : "#f1f1f1";
        }}
      >
        {theme === "light" ? <FaMoon /> : <FaSun />}
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
    </div>
  );
};

export default ThemeToggle;
