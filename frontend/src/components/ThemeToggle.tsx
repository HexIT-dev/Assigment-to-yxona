import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon size={20}  />
      ) : (
        <Sun size={20}  />
      )}
    </button>
  );
};

export default ThemeToggle;
