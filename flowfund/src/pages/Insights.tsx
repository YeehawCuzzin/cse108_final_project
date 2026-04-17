import Card from "../components/Card";
import Pill from "../components/Pill";
import { AppState } from "../lib/types";
import { monthKey, sumByCategory, formatUSD } from "../lib/moneyMath";

export default function Insights(props: { state: AppState; nowISO: string }) {
  const month = monthKey(props.nowISO);
  const totals = sumByCategory(props.state.transactions, month);

  const top = Object.entries(totals)
    .filter(([c]) => c !== "Income")
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3);

  const savings = totals["Savings"] ?? 0;
  const savingsTarget = props.state.budgets.find(b => b.category === "Savings")?.monthlyTarget ?? 0;

  const suggestions = [
    top[0] ? `Top spend: ${top[0][0]} (${formatUSD(top[0][1])}) — consider a “Stretch” target if it’s creeping up.` : null,
    savingsTarget > 0
      ? (savings >= savingsTarget
        ? `Savings is on track (${formatUSD(savings)} / ${formatUSD(savingsTarget)}). Keep that energy.`
        : `Savings is below target (${formatUSD(savings)} / ${formatUSD(savingsTarget)}). Even +$10/week closes the gap fast.`)
      : `Set a Savings target in Plan to unlock cleaner forecasting.`,
    `Use “Ask FlowFund” to check purchases before they hit your buffer.`,
  ].filter(Boolean) as string[];

  return (
    <div className="grid cols-2">
      <Card title="Weekly-style Summary" right={<Pill label="Plain language" />}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>This month, in one view</div>
        <ul className="muted" style={{ marginTop: 0 }}>
          <li>You spent most in: {top.map(t => t[0]).join(", ") || "—"}.</li>
          <li>Your savings progress is {formatUSD(savings)} toward {formatUSD(savingsTarget || 0)}.</li>
          <li>Next step: tighten one category by a small amount instead of doing a full “budget reset.”</li>
        </ul>
      </Card>

      <Card title="Next best actions" right={<Pill label="Actionable" />}>
        <div style={{ display: "grid", gap: 10 }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)"
            }}>
              {s}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
