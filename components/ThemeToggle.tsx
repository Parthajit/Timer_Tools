import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-between w-14 h-8 px-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-500/20"
      aria-label="Toggle Theme"
    >
      <div 
        className={`absolute w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 ease-in-out ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
      <Sun 
        size={14} 
        className={`z-10 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-30' : 'opacity-100 text-amber-500'}`} 
      />
      <Moon 
        size={14} 
        className={`z-10 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100 text-blue-400' : 'opacity-30'}`} 
      />
    </button>
  );
};

export default ThemeToggle;