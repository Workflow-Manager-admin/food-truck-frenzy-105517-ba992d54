import React from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * RecipeCardPopup shows a pop-up recipe guide for onboarding.
 * @param {object} props
 * @param {object} recipe - {name, items} structure.
 * @param {boolean} visible - Whether to show the popup.
 * @param {function} onDismiss - Called when player clicks to dismiss.
 */
export default function RecipeCardPopup({ recipe, visible, onDismiss }) {
  if (!visible || !recipe) return null;

  // Ingredient name to emoji helper (must match main game)
  function getIngredientEmoji(name) {
    switch (name) {
      case "bun": return "🍔";
      case "lettuce": return "🥬";
      case "patty": return "🥩";
      case "cheese": return "🧀";
      case "sauce": return "🧂";
      case "noodle": return "🍜";
      default: return "❔";
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2001,
        background: "rgba(32,16,32,0.42)"
      }}
      aria-modal="true"
      aria-label={`Recipe card: ${recipe.name}`}
      tabIndex={-1}
      onClick={onDismiss}
    >
      <div
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%) scale(1)",
          background: "#fdfdfc",
          border: "4px solid #fd91a1",
          borderRadius: 24,
          minWidth: 310,
          maxWidth: 360,
          boxShadow: "0 12px 50px #fd91a199",
          padding: "32px 28px 24px 28px",
          textAlign: "center"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: "1.8em",
            fontWeight: "bold",
            letterSpacing: "1px",
            color: "#921635",
            marginBottom: 6
          }}
        >
          📋 {recipe.name} Recipe
        </div>
        <div
          style={{
            margin: "8px 0 14px 0",
            fontSize: "1.17em",
            color: "#272e34"
          }}
        >
          Add these in order:
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 7,
            marginBottom: 22
          }}
        >
          {recipe.items.map((i, n) => (
            <span key={n} style={{
              fontSize: "2em",
              background: "#ffe7e7",
              border: "2.5px solid #fd91a1",
              borderRadius: "14px",
              padding: "4px 12px 3px 12px",
              marginRight: n !== recipe.items.length-1 ? 3 : 0
            }}>
              {getIngredientEmoji(i)}
            </span>
          ))}
        </div>
        <div style={{color:"#921635", marginBottom: 17}}>Serve in this order to make a perfect <b>{recipe.name}</b>!</div>
        <button
          style={{
            background: "#fd91a1",
            border: "none",
            color: "#fff",
            borderRadius: "8px",
            padding: "10px 26px",
            fontSize: "1.19em",
            fontWeight: 700,
            letterSpacing: ".5px",
            cursor: "pointer",
            boxShadow: "0 1px 6px #fea2",
            transition: "background 0.12s"
          }}
          onClick={onDismiss}
          autoFocus
        >Got it!</button>
        <div style={{ color: "#888", fontSize: "0.98em", marginTop: 8 }}>
          Click anywhere to dismiss.
        </div>
      </div>
    </div>
  );
}
