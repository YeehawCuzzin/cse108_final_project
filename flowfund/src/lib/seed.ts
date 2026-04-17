import { AppState } from "./types";

export const seedState: AppState = {
  currency: "USD",
  paycheck: {
    cadence: "biweekly",
    nextPayDateISO: "2026-01-02",
    typicalNetPay: 2200,
  },
  bills: [
    { id: "b1", name: "Rent", dueDay: 1, amount: 1600, category: "Housing", autopay: true },
    { id: "b2", name: "Internet", dueDay: 8, amount: 65, category: "Utilities", autopay: true },
    { id: "b3", name: "Phone", dueDay: 12, amount: 55, category: "Utilities", autopay: true },
    { id: "b4", name: "Streaming", dueDay: 15, amount: 19.99, category: "Subscriptions", autopay: true },
    { id: "b5", name: "Car Insurance", dueDay: 22, amount: 120, category: "Transportation", autopay: true },
  ],
  budgets: [
    { category: "Food", monthlyTarget: 450 },
    { category: "Transportation", monthlyTarget: 220 },
    { category: "Fun", monthlyTarget: 180 },
    { category: "Personal", monthlyTarget: 150 },
    { category: "Health", monthlyTarget: 120 },
    { category: "Subscriptions", monthlyTarget: 60 },
    { category: "Savings", monthlyTarget: 300 },
  ],
  transactions: [
    { id: "t1", dateISO: "2025-12-18", merchant: "Paycheck", amount: -2200, category: "Income" },
    { id: "t2", dateISO: "2025-12-19", merchant: "Rent", amount: 1600, category: "Housing" },
    { id: "t3", dateISO: "2025-12-20", merchant: "Trader Joe's", amount: 78.42, category: "Food" },
    { id: "t4", dateISO: "2025-12-21", merchant: "Chevron", amount: 46.10, category: "Transportation" },
    { id: "t5", dateISO: "2025-12-22", merchant: "Netflix", amount: 15.49, category: "Subscriptions" },
    { id: "t6", dateISO: "2025-12-23", merchant: "Amazon", amount: 52.33, category: "Personal" },
    { id: "t7", dateISO: "2025-12-24", merchant: "Cafe", amount: 18.25, category: "Food" },
    { id: "t8", dateISO: "2025-12-26", merchant: "Gym", amount: 29.99, category: "Health" },
    { id: "t9", dateISO: "2025-12-27", merchant: "Savings Transfer", amount: 200, category: "Savings" },
    { id: "t10", dateISO: "2025-12-28", merchant: "Movie", amount: 22.00, category: "Fun" },
  ],
  ui: { fontScale: 1 },
};
