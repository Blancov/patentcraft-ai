import { createContext } from 'react';

// Add default context value
const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {}
});

export default ThemeContext;