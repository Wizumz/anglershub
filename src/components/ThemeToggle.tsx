'use client';

import { useTheme } from '../utils/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-3 rounded-lg border transition-all duration-300 font-mono
        ${theme === 'dark' 
          ? 'bg-terminal-bg-alt border-terminal-border text-terminal-accent hover:bg-terminal-border' 
          : 'bg-light-bg-alt border-light-border text-light-accent hover:bg-light-border'
        }
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${theme === 'dark' ? 'focus:ring-terminal-accent' : 'focus:ring-light-accent'}
      `}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {theme === 'dark' ? '☾' : '☽'}
        </span>
        <span className="text-xs uppercase tracking-wider">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </div>
    </button>
  );
}