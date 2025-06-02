// context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemTheme === 'dark');

  const toggleTheme = () => setIsDark(prev => !prev);

  const theme = {
    isDark,
    toggleTheme,
    background: isDark ? '#111827' : '#f3f4f6',
    primary: isDark ? '#ffffff' : '#1f2937', 
    text: isDark ? '#f3f4f6' : '#374151',
    buttonBackground: '#2563eb',
    buttonText: '#ffffff',
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
