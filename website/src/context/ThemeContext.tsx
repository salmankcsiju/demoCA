import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'atelier' | 'wine_red';

interface ThemeContextType {
  activeTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  atelier: {
    primary: '#B11226',   // Crimson
    secondary: '#000000', // Black
    light: '#FFFFFF',     // White
    warm: '#F4F4F4',      // Soft Grey
    accent: '#000000'
  },
  wine_red: {
    primary: '#D4AF37',   // Gold
    secondary: '#FAF9F6', // Champagne
    light: '#722F37',     // User's Wine Red
    warm: '#5B252C',      // Deep Burgundy
    accent: '#3A181C'
  }
};

import api from '../utils/api';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('casa_amora_theme') as Theme) || 'wine_red';
  });

  // Sync with backend on mount
  useEffect(() => {
    const fetchTheme = async () => {
       try {
         const response = await api.get('config/');
         const theme = response.data.active_theme;
         if (theme && (theme === 'atelier' || theme === 'wine_red')) {
            setActiveThemeState(theme);
         }
       } catch (err) {
         console.warn("Could not sync theme from backend, using local.");
       }
    };
    fetchTheme();
  }, []);

  const setTheme = async (theme: Theme) => {
    setActiveThemeState(theme);
    localStorage.setItem('casa_amora_theme', theme);
    
    // Persist to backend if staff/admin
    try {
      await api.post('staff/update-theme/', { theme });
    } catch (err) {
      console.error("Failed to persist theme to backend");
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const colors = themes[activeTheme];

    root.style.setProperty('--color-brand-primary', colors.primary);
    root.style.setProperty('--color-brand-secondary', colors.secondary);
    root.style.setProperty('--color-brand-light', colors.light);
    root.style.setProperty('--color-brand-warm', colors.warm);
    root.style.setProperty('--color-brand-accent', colors.accent);
    
    document.body.style.backgroundColor = colors.light;
    document.body.style.color = colors.secondary;
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
