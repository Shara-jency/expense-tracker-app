import React, { createContext, useState, useContext } from 'react';
import { colors, spacing, borderRadius } from '../styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default theme is 'dark'

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const activeColors = colors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: activeColors, spacing, borderRadius }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);