import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('wedding');
  const [customColors, setCustomColors] = useState({});

  const updateTheme = (theme) => {
    setCurrentTheme(theme);
  };

  const updateColors = (colors) => {
    setCustomColors(prev => ({ ...prev, ...colors }));
  };

  const value = {
    currentTheme,
    customColors,
    updateTheme,
    updateColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};