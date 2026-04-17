import { AppState } from "./types";
import { computeSafeToSpend, formatUSD, monthKey, sumByCategory } from "./moneyMath";

/**
 * Lightweight “Ask-Anything” engine for MVP.
 * - Deterministic + explainable
 * - Returns an answer + the reasoning bullets
 */
export function answerQuestion(state: AppState, nowISO: string, question: string) {
  const q = question.trim().toLowerCase();
  const safe = computeSafeToSpend(state, nowISO);

  // Parse a "$number" or "number" from the question
  const numberMatch = q.match(/(\$?\s*\d+(\.\d{1,2})?)/);
  const parsedCost = numberMatch ? parseFloat(numberMatch[0].replace("$", "").trim()) : null;

  // Helpers
  const month = monthKey(nowISO);
  const byCat = sumByCategory(state.transactions, month);

  if (q.includes("can i afford") || q.includes("afford") || q.includes("buy")) {
    if (parsedCost == null) {
      return {
        title: "Quick check",
        answer: "Tell me the price (example: “Can I afford $120?”) and I’ll run the numbers.",
        reasoning: ["I didn’t see a clear amount in your question."],
      };
    }
    const ok = safe.safeToSpend >= parsedCost;
    return {
      title: "Affordability check",
      answer: ok
        ? `Yes — this looks safe. You have about ${formatUSD(safe.safeToSpend)} safe-to-spend right now.`
        : `Not safely right now. You’re at about ${formatUSD(safe.safeToSpend)} safe-to-spend.`,
      reasoning: [
        `Safe-to-spend = net this month (${formatUSD(safe.netThisMonth)}) - bills due before next pay (${formatUSD(safe.billsTotal)}) - remaining savings target (${formatUSD(safe.savingsRemaining)}).`,
        `You asked about: ${formatUSD(parsedCost)}.`,
        ok ? "This stays within the current buffer." : "This would push you past the current buffer.",
      ],
    };
  }

  if (q.includes("why") && (q.includes("tight") || q.includes("higher") || q.includes("overspend"))) {
    // Find top expense categories (ignore Income)
    const entries = Object.entries(byCat)
      .filter(([cat]) => cat !== "Income")
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

    const top = entries.slice(0, 3).map(([c, v]) => `${c}: ${formatUSD(v)}`);
    return {
      title: "What’s driving spending",
      answer: `Top spending areas this month are: ${top.join(", ")}.`,
      reasoning: [
        "I summarized your current month transactions by category.",
        "If you want, I can suggest a realistic “Comfortable / Stretch / Risk” target for each.",
      ],
    };
  }

  if (q.includes("how much") && q.includes("save")) {
    const savingsTarget = state.budgets.find(b => b.category === "Savings")?.monthlyTarget ?? 0;
    return {
      title: "Savings plan",
      answer: `Your current monthly savings target is ${formatUSD(savingsTarget)}. Want it to be more aggressive or more chill?`,
      reasoning: [
        "This is editable in Plan → Budget Sliders.",
        "A common starting point is 10–20% of net income, but FlowFund can adapt to your real bills and goals.",
      ],
    };
  }

  return {
    title: "FlowFund Assistant",
    answer: "Ask me things like: “Can I afford $120?”, “Why was this month tight?”, or “How much should I save?”",
    reasoning: ["MVP assistant supports affordability + trend explanations + savings guidance."],
  };
}
