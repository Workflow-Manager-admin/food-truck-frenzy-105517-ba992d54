import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { submitScore, fetchLeaderboard } from "./scoreService"; // Import Firebase logic

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load leaderboard on mount
  useEffect(() => {
    handleFetchLeaderboard();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  // Handler to submit a score to the backend
  const handleSubmitScore = async e => {
    e.preventDefault();
    setSubmitStatus('');
    if (!playerName || isNaN(score)) {
      setSubmitStatus('Please enter a name and valid score.');
      return;
    }
    setLoading(true);
    try {
      await submitScore(playerName, Number(score));
      setSubmitStatus('Score submitted! Refreshing leaderboard...');
      setPlayerName('');
      setScore(0);
      await handleFetchLeaderboard();
    } catch (e) {
      setSubmitStatus('Failed to submit: ' + e.message);
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  // Handler to load leaderboard
  async function handleFetchLeaderboard() {
    setLoading(true);
    try {
      const result = await fetchLeaderboard(10);
      setLeaderboard(result);
    } catch (e) {
      setLeaderboard([]);
    }
    setLoading(false);
  }

  return (
    <div className="App">
      <header className="App-header">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          Current theme: <strong>{theme}</strong>
        </p>
        <section style={{padding:16, margin:"20px 0", background: "rgba(255,255,255,0.07)", borderRadius:12, border:"1px solid var(--border-color)"}}>
          <h2>Submit Score</h2>
          <form onSubmit={handleSubmitScore} style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center"}}>
            <input
              type="text"
              placeholder="Player name"
              value={playerName}
              maxLength={20}
              disabled={loading}
              onChange={e => setPlayerName(e.target.value)}
              style={{padding:8,borderRadius:4,border:"1px solid #ccc",minWidth:100}}
            />
            <input
              type="number"
              placeholder="Score"
              value={score}
              disabled={loading}
              onChange={e => setScore(e.target.value)}
              style={{padding:8,borderRadius:4,border:"1px solid #ccc",minWidth:80}}
            />
            <button type="submit" className="theme-toggle" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
          <div style={{marginTop:8,color:"#e87a41"}}>{submitStatus}</div>
        </section>
        <section style={{margin:"20px 0",padding:16,background: "rgba(255,255,255,0.08)", borderRadius:12, border:"1px solid var(--border-color)"}}>
          <h2>Leaderboard</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ol>
              {leaderboard.map((entry, i) => (
                <li key={i}>
                  <b>{entry.playerName}</b>: {entry.score}
                </li>
              ))}
            </ol>
          )}
          <button className="theme-toggle" onClick={handleFetchLeaderboard} style={{marginTop:8}}>Refresh Leaderboard</button>
        </section>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
