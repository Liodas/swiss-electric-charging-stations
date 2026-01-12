import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme = prefersDark ? 'dark' : 'light';
          setTheme(systemTheme);
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
        setTheme('light');
      }
      setIsInitialized(true);
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};