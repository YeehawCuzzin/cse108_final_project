import Card from "./Card";
import Pill from "./Pill";
import { formatUSD } from "../lib/moneyMath";

export default function MoneyFlow(props: {
  income: number; fixed: number; variable: number; savings: number; remaining: number;
}) {
  // income is positive display value (even though income transactions are negative)
  const items = [
    { label: "Income", value: props.income, tone: "good" as const },
    { label: "Fixed", value: props.fixed, tone: "warn" as const },
    { label: "Variable", value: props.variable, tone: "neutral" as const },
    { label: "Savings", value: props.savings, tone: "good" as const },
    { label: "Remaining", value: props.remaining, tone: props.remaining >= 0 ? "good" as const : "bad" as const },
  ];

  return (
    <Card title="Money Flow Path" right={<Pill label="Visual clarity" />}>
      <div className="row" style={{ gap: 12 }}>
        {items.map((it, idx) => (
          <div key={it.label} style={{ minWidth: 140 }}>
            <div className="muted small">{it.label}</div>
            <div style={{ fontSize: 18, fontWeight: 750 }}>{formatUSD(it.value)}</div>
            {idx < items.length - 1 && <div className="muted small">→</div>}
          </div>
        ))}
      </div>
      <div className="muted small" style={{ marginTop: 10 }}>
        This is the “story view” — built to be understandable fast, not finance-y.
      </div>
    </Card>
  );
}
