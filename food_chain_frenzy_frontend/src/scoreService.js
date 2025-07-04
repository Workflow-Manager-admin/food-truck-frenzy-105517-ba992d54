import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * PUBLIC_INTERFACE
 * Submits a score to the 'scoreboard' collection in Firestore.
 * @param {string} playerName - The player's display name.
 * @param {number} score - The player's score to record.
 * @returns {Promise<string>} - The Firestore document ID of the newly created score entry.
 */
export async function submitScore(playerName, score) {
  try {
    const docRef = await addDoc(collection(db, "scoreboard"), {
      playerName,
      score,
      timestamp: Date.now()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error submitting score: ", e);
    throw e;
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetches top N scores from the 'scoreboard' collection, ordered by score (descending).
 * @param {number} topN - How many leaderboard entries to retrieve.
 * @returns {Promise<Array<{ playerName: string, score: number }>>}
 */
export async function fetchLeaderboard(topN = 10) {
  try {
    const scoresQuery = query(
      collection(db, "scoreboard"),
      orderBy("score", "desc"),
      limit(topN)
    );
    const querySnapshot = await getDocs(scoresQuery);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.error("Error fetching leaderboard: ", e);
    throw e;
  }
}
