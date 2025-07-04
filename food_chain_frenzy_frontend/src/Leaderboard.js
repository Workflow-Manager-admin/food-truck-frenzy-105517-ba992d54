import React, { useEffect, useState } from "react";
import "./App.css";
import { fetchLeaderboardByTimeframe } from "./scoreService";

/**
 * PUBLIC_INTERFACE
 * Leaderboard component for Food Chain Frenzy.
 * Displays top player scores from Firebase by daily or weekly timeframe.
 * Provides UI to toggle between daily and weekly leaderboards.
 */
export default function Leaderboard({
  // Optionally pass in a callback to close leaderboard UI etc.
  onClose
}) {
  const [tab, setTab] = useState("daily"); // 'daily' | 'weekly'
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [refreshTimer, setRefreshTimer] = useState(0);

  // Helper: Computes reference time boundary based on tab (for firestore query)
  function getStartOfToday() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime(); // ms since epoch
  }
  function getStartOfWeek() {
    const now = new Date();
    // Sunday is 0, subtract (0 = Sun, so setHours(0,...), minus getDay())
    now.setHours(0, 0, 0, 0);
    now.setDate(now.getDate() - now.getDay()); // back to Sunday
    return now.getTime();
  }

  // Core: fetch scores for the selected tab
  async function fetchScores() {
    setLoading(true);
    setErr("");
    try {
      let sinceTs = 0;
      if (tab === "daily") {
        sinceTs = getStartOfToday();
      } else {
        sinceTs = getStartOfWeek();
      }
      const data = await fetchLeaderboardByTimeframe(
        10, // top 10 scores
        sinceTs
      );
      setEntries(data);
    } catch (e) {
      setErr("Failed to fetch leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch scores when tab, refresh request, or component mounts
  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line
  }, [tab, refreshTimer]);

  // Pull-to-refresh style
  function handleRefresh() {
    setRefreshTimer((t) => t + 1);
  }

  // Fun medal emojis for podium
  function getMedal(rank) {
    return rank === 0
      ? "🥇"
      : rank === 1
      ? "🥈"
      : rank === 2
      ? "🥉"
      : "";
  }

  return (
    <div
      className="leaderboard-container"
      style={{
        background: "#fff6fc",
        border: "3.5px solid #fd91a1",
        borderRadius: 22,
        boxShadow: "0 8px 24px #fd91a188",
        margin: "30px auto 18px auto",
        padding: "30px 22px 22px 22px",
        maxWidth: 370,
        minWidth: 300,
        minHeight: 220,
        position: "relative",
        zIndex: 1023,
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {onClose && (
          <button
            className="theme-toggle"
            style={{
              marginTop: 0,
              marginBottom: 0,
              fontSize: 18,
              background: "#fd91a1",
              color: "#fff",
              padding: "4px 12px",
              border: "1.5px solid #fa459a",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            title="Close leaderboard"
            onClick={onClose}
            tabIndex={0}
            aria-label="Close Leaderboard"
          >
            ✕
          </button>
        )}
      </div>
      <div
        style={{
          fontSize: "1.58em",
          fontWeight: 800,
          color: "#921635",
          textAlign: "center",
          marginBottom: 11,
          letterSpacing: 1,
        }}
      >
        🏆 Leaderboard
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        <button
          style={{
            background: tab === "daily" ? "#fd91a1" : "#fff",
            color: tab === "daily" ? "#fff" : "#fd91a1",
            fontWeight: tab === "daily" ? "bold" : 600,
            border: "2px solid #fd91a1",
            borderRadius: 8,
            padding: "7px 19px",
            fontSize: "1em",
            marginBottom: 2,
            cursor: tab === "daily" ? "default" : "pointer",
            opacity: tab === "daily" ? 1 : 0.92,
            transition: "background .14s",
          }}
          disabled={tab === "daily"}
          aria-selected={tab === "daily"}
          onClick={() => setTab("daily")}
        >
          Daily
        </button>
        <button
          style={{
            background: tab === "weekly" ? "#fd91a1" : "#fff",
            color: tab === "weekly" ? "#fff" : "#fd91a1",
            fontWeight: tab === "weekly" ? "bold" : 600,
            border: "2px solid #fd91a1",
            borderRadius: 8,
            padding: "7px 19px",
            fontSize: "1em",
            marginBottom: 2,
            cursor: tab === "weekly" ? "default" : "pointer",
            opacity: tab === "weekly" ? 1 : 0.92,
            transition: "background .14s",
          }}
          disabled={tab === "weekly"}
          aria-selected={tab === "weekly"}
          onClick={() => setTab("weekly")}
        >
          Weekly
        </button>
        <button
          style={{
            background: "#fff",
            color: "#fd91a1",
            border: "2px solid #fd91a1",
            borderRadius: 8,
            padding: "7px 11px",
            fontSize: "1em",
            marginBottom: 2,
            marginLeft: "11px",
            cursor: "pointer",
            opacity: 0.92,
          }}
          title="Refresh leaderboard"
          aria-label="Refresh leaderboard"
          onClick={handleRefresh}
        >
          ⟳
        </button>
      </div>
      <div style={{ marginTop: 13 }}>
        {loading && (
          <div style={{ color: "#fd91a1", fontWeight: "bold" }}>Loading...</div>
        )}
        {err && (
          <div style={{ color: "#fd5757", margin: 7 }}>
            {err}
            <button
              style={{
                background: "#fff",
                color: "#fd5757",
                border: "1.5px solid #fd91a1",
                borderRadius: "7px",
                marginLeft: 12,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1em",
              }}
              onClick={fetchScores}
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !err && (
          <table
            style={{
              width: "100%",
              marginTop: 5,
              background: "#fffafd",
              borderCollapse: "separate",
              borderSpacing: "0 5.5px",
            }}
            aria-label={`Leaderboard ${tab}`}
          >
            <thead>
              <tr style={{ color: "#921635", fontWeight: 700, fontSize: "1.12em" }}>
                <th style={{ textAlign: "left" }}>#</th>
                <th style={{ textAlign: "left" }}>Player</th>
                <th style={{ textAlign: "right" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: "#aaa", textAlign: "center", fontWeight: 500 }}>
                    No scores yet!
                  </td>
                </tr>
              )}
              {entries.map((entry, i) => (
                <tr
                  key={entry.playerName + entry.score + entry.timestamp || i}
                  style={{
                    background: i < 3 ? "#ffd0dc" : "#fffafd",
                    fontWeight: i < 3 ? 700 : 500,
                    boxShadow: i < 3 ? "0 2px 9px #fd91a155" : undefined,
                    borderRadius: 13,
                  }}
                >
                  <td style={{ fontSize: "1.13em", width: 34 }}>{getMedal(i) || i + 1}</td>
                  <td style={{ textAlign: "left", fontSize: "1.08em" }}>
                    {entry.playerName}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "1.08em" }}>
                    {entry.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div
        aria-label="Leaderboard attribution"
        style={{
          fontSize: "0.86em",
          marginTop: 14,
          opacity: 0.7,
          color: "#921635",
          textAlign: "right",
        }}
      >
        Powered by Firebase
      </div>
    </div>
  );
}
