'use client';

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const STORAGE_KEY = 'hammad-batteries-theme';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') {
      return 'dark';
    }

    const currentTheme = document.documentElement.getAttribute('data-theme');
    return currentTheme === 'light' || currentTheme === 'dark' ? currentTheme : 'dark';
  });

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => {
        const updatedTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(updatedTheme);
        applyTheme(updatedTheme);
      }}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      <span className="btn-text">{theme === 'dark' ? 'Bright' : 'Dark'}</span>
    </button>
  );
}
