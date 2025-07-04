import React from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Badge displays an earned achievement with a fun icon and label.
 * @param {object} props
 * @param {string} icon - Emoji or URL string.
 * @param {string} label - Name/title of the badge.
 * @param {string} desc - Optional description.
 * @param {boolean} earned - Whether the badge is unlocked.
 * @returns {JSX.Element}
 */
export default function Badge({ icon, label, desc, earned }) {
  return (
    <div
      className="badge"
      title={desc}
      aria-label={label}
      style={{
        opacity: earned ? 1 : 0.4,
        filter: earned ? "drop-shadow(0 4px 8px #ffd77288)" : "grayscale(0.77)",
        background: earned ? "#fff8e1" : "#ececec",
        border: earned ? "2.5px solid #ffd772" : "2.5px solid #ccc",
        borderRadius: 22,
        padding: "10px 16px",
        minWidth: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "7px 7px 13px 7px",
        boxShadow: earned ? "0 2px 6px #ffd77254" : undefined,
        transition: "opacity .22s, filter .22s",
        position: "relative"
      }}>
      <span style={{
        fontSize: "2.3em", marginBottom: 2, textShadow: earned ? "0 2px 7px #ffd77288" : "0 0 1px #eee"
      }}>
        {icon}
      </span>
      <span style={{
        fontSize: "1em",
        fontWeight: "bold",
        color: "#921635",
        marginBottom: 2,
        letterSpacing: ".8px",
        textAlign: "center"
      }}>
        {label}
      </span>
      {desc && <span style={{
        fontSize: ".91em", color: "#be99ba", marginTop: 2, textAlign: "center"
      }}>{desc}</span>}
      {!earned && <span style={{
        fontSize: "0.8em", color: "#fd91a1", position: "absolute", bottom: 3
      }}>?</span>}
    </div>
  );
}
