import React, { useState, useEffect } from 'react';
import './App.css';
import FoodChainFrenzyGame from "./FoodChainFrenzyGame";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  // Apply theme to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header" style={{minHeight:0, paddingBottom:0}}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <FoodChainFrenzyGame />
      </header>
    </div>
  );
}

export default App;
