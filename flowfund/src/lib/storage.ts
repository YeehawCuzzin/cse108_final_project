import { AppState } from "./types";
import { seedState } from "./seed";

const KEY = "flowfund_state_v1";

/**
 * Loads state from localStorage.
 * If none exists, returns a seeded state so the app is not empty on first launch.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedState;
    const parsed = JSON.parse(raw) as AppState;
    return parsed ?? seedState;
  } catch {
    return seedState;
  }
}

/**
 * Saves state to localStorage.
 * Kept intentionally simple for MVP.
 */
export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

/**
 * Reset to seed (demo / troubleshooting).
 */
export function resetState() {
  localStorage.setItem(KEY, JSON.stringify(seedState));
}
