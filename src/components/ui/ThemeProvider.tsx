'use client'; // <-- FIX: Marks this file as a Client Component

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the Theme types
type Theme = 'dark' | 'light' | 'system';

// Define the shape of the Context
interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Create the Context with a default value
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Helper function to get the initial theme from local storage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const storedTheme = localStorage.getItem('theme') as Theme | null;
  if (storedTheme) {
    return storedTheme;
  }

  return 'system';
};

// Provider Component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setLocalTheme] = useState<Theme>(getInitialTheme);

  // Effect to apply the theme class to the document root and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const appliedTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    root.classList.add(appliedTheme);

    // Only save the user's explicit preference ('light', 'dark', or 'system')
    // not the resolved system value.
    localStorage.setItem('theme', theme);

  }, [theme]);

  // Public function to change and save the theme
  const setTheme = (newTheme: Theme) => {
    setLocalTheme(newTheme);
  };

  const contextValue: ThemeContextProps = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook to consume the theme context
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
