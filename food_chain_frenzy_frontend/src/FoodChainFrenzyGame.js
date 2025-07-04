import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * FoodChainFrenzyGame is the main game component for Food Chain Frenzy.
 * Features:
 *  - Animated conveyor of ingredients
 *  - Drag-and-drop and click-to-collect mechanics
 *  - Visible orders with timers
 *  - Combo streak (bonus for correct consecutive orders)
 *  - Rage meter (gameover if too many missed)
 */
const INGREDIENTS = [
  { name: "bun", color: "#fdad5a" },
  { name: "lettuce", color: "#61d95a" },
  { name: "patty", color: "#8f4d20" },
  { name: "cheese", color: "#fde45a" },
  { name: "sauce", color: "#e85773" },
  { name: "noodle", color: "#ffd398" }
];

// For representative sample only
const RECIPES = [
  { name: "Burger", items: ["bun", "lettuce", "patty", "cheese", "bun"] },
  { name: "Veggie", items: ["bun", "lettuce", "cheese", "bun"] },
  { name: "Saucy Noods", items: ["noodle", "sauce", "lettuce"] }
];
const MAX_ORDERS = 2;
const CONVEYOR_WIDTH = 320;

function getRandomIngredient() {
  return INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
}

function generateOrder() {
  const order = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  return { ...order, startTime: Date.now(), duration: 9000 + Math.random() * 4000, id: Math.random() };
}

function isPlateMatchOrder(plate, order) {
  if (plate.length !== order.items.length) return false;
  for (let i = 0; i < plate.length; ++i) {
    if (plate[i] !== order.items[i]) return false;
  }
  return true;
}

/** UI Helper: ingredient emoji/representation */
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

/** Very cartoonish customer face */
function CustomerFace({ angry }) {
  return (
    <span style={{
      fontSize: "2.2em",
      filter: angry ? "hue-rotate(-48deg) saturate(160%)" : undefined,
      transition: "filter 0.4s"
    }}>
      {angry ? "😡" : "😃"}
    </span>
  );
}

export default function FoodChainFrenzyGame() {
  // Conveyor state: ingredients that move across, each with id, type, position
  const [conveyor, setConveyor] = useState([]);
  // Orders (like customers)
  const [orders, setOrders] = useState([]);
  // Ingredients currently built on the player's plate
  const [plate, setPlate] = useState([]);
  // Score, combo, misses/rage
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [rage, setRage] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  // ingredient being dragged
  const [dragged, setDragged] = useState(null);
  const conveyorRef = useRef();

  /** Periodically animate conveyor, add new ingredient */
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setConveyor(prev => {
        // Advance position, remove if offscreen
        const advanced = prev.map(item => ({
          ...item,
          x: item.x + 2
        })).filter(item => item.x < CONVEYOR_WIDTH);
        // Add new ingredient at left randomly
        if (Math.random() < 0.3 || advanced.length === 0) {
          advanced.push({ ...getRandomIngredient(), x: -30, id: Math.random() });
        }
        return advanced;
      });
    }, 22);
    return () => clearInterval(interval);
  }, [gameOver]);

  /** Spawn and timeout orders */
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setOrders(prev => {
        // Remove expired orders, penalize if missed
        let newOrders = prev.filter(order => {
          if (Date.now() - order.startTime < order.duration) return true;
          // missed order: rage +1, combo reset
          setRage(r => r + 1);
          setCombo(0);
          return false;
        });
        // Spawn new order if needed
        if (newOrders.length < MAX_ORDERS) {
          newOrders = [...newOrders, generateOrder()];
        }
        return newOrders;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [gameOver]);

  /** End game if rage > 4 */
  useEffect(() => {
    if (rage > 4 && !gameOver) setGameOver(true);
  }, [rage, gameOver]);

  /** Reset area when restarting */
  function handleRestart() {
    setCombo(0);
    setScore(0);
    setRage(0);
    setGameOver(false);
    setOrders([generateOrder()]);
    setPlate([]);
  }

  /** When dropping/clicking ingredient, add to plate */
  function handleCollectIngredient(ingredientName) {
    if (gameOver) return;
    setPlate(prev =>
      prev.length < 6 ? [...prev, ingredientName] : prev
    );
  }

  /** Handler if drag finishes on plate area */
  function handleDropOnPlate(e) {
    const ingredient = dragged;
    if (!ingredient) return;
    setDragged(null);
    handleCollectIngredient(ingredient.name);
    // Remove the conveyor image for that id
    setConveyor(prev => prev.filter(item => item.id !== ingredient.id));
  }

  /** Handler for serving plate to orders */
  function handleServe() {
    if (gameOver || orders.length === 0) return;
    const curOrder = orders[0];
    if (isPlateMatchOrder(plate, curOrder)) {
      // Success: calc time left for bonus, combo increment
      const elapsed = Date.now() - curOrder.startTime;
      const left = Math.max(0, curOrder.duration - elapsed);
      const base = 100;
      const tip = Math.floor(left / 1200);
      const comboBonus = combo > 1 ? combo * 8 : 0;
      setScore(s => s + base + tip + comboBonus);
      setCombo(c => c + 1);
      setOrders(orders => orders.slice(1)); // pop this order
      setPlate([]);
    } else {
      // Failed: rage, reset combo
      setRage(r => r + 1);
      setCombo(0);
      setPlate([]); // Drop your mess!
    }
  }

  /** UI: Animated conveyor belt with drag/clickable ingredients */
  function renderConveyor() {
    return (
      <div
        ref={conveyorRef}
        style={{
          width: "330px",
          height: "64px",
          background: "#eee",
          border: "2.5px solid #9e8",
          margin: "0 auto 8px auto",
          borderRadius: "32px",
          boxShadow: "0 2px 8px #efe5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center"
        }}
      >
        {conveyor.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={e => {setDragged(item);}}
            onDragEnd={e => setDragged(null)}
            tabIndex={0}
            onClick={() => handleCollectIngredient(item.name)}
            style={{
              position: "absolute",
              left: `${item.x}px`,
              top: "13px",
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: item.color,
              border: dragged && dragged.id === item.id ? "3px solid #0cf" : "3px solid #fff",
              boxShadow: "0 2px 6px #0002",
              fontSize: 25,
              textAlign: "center",
              lineHeight: "38px",
              cursor: "grab",
              opacity: dragged && dragged.id === item.id ? 0.6 : 1,
              userSelect: "none",
              transition: "box-shadow 0.2s"
            }}
            aria-label={item.name}
          >
            {getIngredientEmoji(item.name)}
          </div>
        ))}
      </div>
    );
  }

  /** UI: Plate build area (drop target for drag, can show what you have) */
  function renderPlate() {
    return (
      <div
        style={{
          minHeight: "52px",
          background: "#fcfcfc",
          border: "2.5px dashed #fd91a1",
          borderRadius: 18,
          margin: "10px auto 8px auto",
          width: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3px"
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDropOnPlate}
        tabIndex={0}
        aria-label="Plate drop area"
      >
        {plate.length === 0 && <span style={{ color: "#bbb" }}>Empty Plate</span>}
        {plate.map((ing, idx) =>
          <span key={idx} style={{ margin: "0 2px", fontSize: "1.6em", transition: "transform 0.22s" }}>
            {getIngredientEmoji(ing)}
          </span>
        )}
      </div>
    );
  }

  /** UI: Orders/timers/customers */
  function renderOrders() {
    return (
      <div style={{ display: "flex", gap: 30, justifyContent: "center", margin: "12px 0 14px 0" }}>
        {orders.map((order, idx) => {
          const left = Math.max(0, (order.duration - (Date.now() - order.startTime)) / order.duration);
          return (
            <div
              key={order.id}
              style={{
                background: "#fff5fa",
                border: "2px solid #fd91a1",
                minWidth: 96,
                padding: "6px 16px 8px 16px",
                borderRadius: 12,
                boxShadow: "0 2px 8px #fea2",
                position: "relative"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 8,
                  top: 5,
                  fontSize: "1.2em"
                }}
              >{order.name}</div>
              <div style={{
                margin: "16px 0 0 0",
                display: "flex",
                flexDirection: "row",
                gap: 2
              }}>
                {order.items.map((i, n) => (
                  <span key={n} style={{
                    fontSize: "1.2em"
                  }}>{getIngredientEmoji(i)}</span>
                ))}
              </div>
              {/* Timer bar */}
              <div style={{
                position: "absolute",
                bottom: 7,
                left: 8,
                width: "82%",
                height: 7,
                background: "#ffe7e7",
                borderRadius: 7
              }}>
                <div style={{
                  width: `${Math.floor(left * 100)}%`,
                  height: "100%",
                  background: "#fd91a1",
                  borderRadius: 7,
                  transition: "width 0.3s"
                }} />
              </div>
              <div style={{
                position: "absolute",
                right: 8,
                top: 5,
                fontSize: "1.6em"
              }}>
                <CustomerFace angry={left < 0.15} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /** Combo meter & score & rage (angry customers) */
  function renderTopBar() {
    return (
      <div style={{
        display: "flex",
        gap: "32px",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12
      }}>
        <span style={{
          background: "#fd91a1",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.12em",
          padding: "4px 16px",
          borderRadius: 10,
          boxShadow: "0 0 4px #fea5"
        }}>Score: {score}</span>
        {/* Combo */}
        <span style={{
          background: combo > 1 ? "#ffd772" : "#eee",
          color: "#921635",
          fontWeight: "bold",
          padding: "4px 14px",
          borderRadius: 10,
          border: combo > 1 ? "2px solid #fdeb02" : undefined,
          transition: "background 0.2s"
        }}>{combo > 1 ? `Combo: x${combo}!` : "Combo: –"}</span>
        {/* RAGE */}
        <span style={{
          background: "#eee",
          color: "#fd91a1",
          fontWeight: "bold",
          borderRadius: 10,
          padding: "4px 10px",
          border: "2px solid #fd91a1",
          boxShadow: rage > 2 ? "0 0 8px #ea1a50" : undefined
        }}>😡 {rage}/5</span>
      </div>
    );
  }

  return (
    <div style={{
      margin: "auto",
      marginTop: 42,
      marginBottom: 10,
      maxWidth: 480,
      background: "#ffe7e7",
      borderRadius: 22,
      boxShadow: "0 8px 30px #fd91a111",
      padding: "16px 16px 40px 16px",
      border: "4px solid #fd91a1",
      minHeight: 460,
      position: "relative"
    }}>
      <div style={{
        fontFamily: "Comic Sans MS, Quicksand, Arial",
        fontWeight: "bold",
        fontSize: "2.0em",
        letterSpacing: "2px",
        color: "#921635",
        background: "#fff3",
        marginBottom: 8
      }}>
        🍳 Food Chain Frenzy
      </div>
      {renderTopBar()}
      {renderOrders()}
      {renderConveyor()}
      <div style={{ marginTop: 8, marginBottom: 6, color: "#333" }}>
        <b>Build:</b> Drag/click ingredient onto your plate, then tap "Serve"!
      </div>
      {renderPlate()}
      <button
        className="theme-toggle"
        style={{
          marginTop: 10,
          marginBottom: 10,
          fontSize: "1.24em",
          fontWeight: "bold",
          background: "#921635"
        }}
        onClick={handleServe}
        disabled={gameOver || plate.length === 0}
      >Serve!</button>

      {/* Game Over */}
      {gameOver &&
        <div style={{
          background: "#921635dd",
          color: "#fff",
          fontWeight: "bold",
          position: "absolute",
          top: 56,
          left: 0,
          width: "100%",
          fontSize: "1.7em",
          padding: "20px 0",
          borderRadius: "12px"
        }}>
          Game Over!<br />
          Final Score: {score}<br />
          <button
            className="theme-toggle"
            style={{ marginTop: 16, fontSize: "1.1em", fontWeight: "bold", background: "#fff", color: "#fa459a", border: "2px solid #fd91a1" }}
            onClick={handleRestart}
          >Restart Game</button>
        </div>
      }
    </div>
  );
}
