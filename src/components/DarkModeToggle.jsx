// frontend/src/components/DarkModeToggle.jsx
// Toggle button for the navbar

import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`
        relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none
        ${isDark ? 'bg-green-700' : 'bg-green-600'}
      `}
    >
      {/* Sliding thumb */}
      <span className={`
        absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md
        flex items-center justify-center transition-all duration-300
        ${isDark ? 'left-7' : 'left-0.5'}
      `}>
        {isDark
          ? <Moon  size={13} className="text-green-800" />
          : <Sun   size={13} className="text-yellow-500" />
        }
      </span>
    </button>
  );
}