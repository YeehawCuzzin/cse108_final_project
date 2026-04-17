import { Category, Transaction } from "./types";

/**
 * Local “AI-like” categorizer:
 * - Uses simple merchant keyword rules
 * - Returns a category + explanation (critical for trust)
 * You can later replace this with an LLM or ML model without changing UI.
 */

type Rule = { keywords: string[]; category: Category; reason: string };

const RULES: Rule[] = [
  { keywords: ["paycheck", "payroll", "salary"], category: "Income", reason: "Looks like income/payroll." },
  { keywords: ["rent", "landlord"], category: "Housing", reason: "Merchant suggests housing/rent." },
  { keywords: ["pg&e", "electric", "water", "internet", "comcast", "xfinity", "att", "verizon"], category: "Utilities", reason: "Common utility provider keyword detected." },
  { keywords: ["trader joe", "whole foods", "kroger", "safeway", "target", "walmart", "costco", "grocery"], category: "Food", reason: "Retail/grocery merchant detected." },
  { keywords: ["uber", "lyft", "chevron", "shell", "exxon", "gas", "parking"], category: "Transportation", reason: "Transportation/fuel keyword detected." },
  { keywords: ["pharmacy", "cv", "walgreens", "doctor", "clinic", "gym"], category: "Health", reason: "Health/fitness keyword detected." },
  { keywords: ["netflix", "spotify", "hulu", "disney", "prime"], category: "Subscriptions", reason: "Subscription/streaming keyword detected." },
  { keywords: ["movie", "cinema", "concert", "game", "ticket"], category: "Fun", reason: "Entertainment keyword detected." },
  { keywords: ["savings", "transfer to savings"], category: "Savings", reason: "Looks like a savings transfer." },
];

export function suggestCategory(merchant: string, amount: number): { category: Category; confidence: number; reason: string } {
  const m = merchant.toLowerCase();

  // Income heuristic: negative amount + payroll keywords
  if (amount < 0 && (m.includes("pay") || m.includes("payroll") || m.includes("salary"))) {
    return { category: "Income", confidence: 0.92, reason: "Negative amount + payroll keyword suggests income." };
  }

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (m.includes(kw)) {
        return { category: rule.category, confidence: 0.82, reason: rule.reason };
      }
    }
  }

  return { category: "Other", confidence: 0.55, reason: "No strong match found; defaulted to Other." };
}

export function recategorize(tx: Transaction): Transaction & { aiReason: string; aiConfidence: number } {
  const s = suggestCategory(tx.merchant, tx.amount);
  return { ...tx, category: s.category, aiReason: s.reason, aiConfidence: s.confidence };
}
