import React from 'react';
import { useTheme } from '@/lib/theme';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
};

export default ThemeToggle;