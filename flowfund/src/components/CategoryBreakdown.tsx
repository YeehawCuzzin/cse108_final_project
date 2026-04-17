import Card from "./Card";
import Progress from "./Progress";
import { formatUSD } from "../lib/moneyMath";
import { BudgetTarget } from "../lib/types";

export default function CategoryBreakdown(props: {
  title: string;
  totals: Record<string, number>;
  budgets: BudgetTarget[];
}) {
  const rows = Object.entries(props.totals)
    .filter(([cat]) => cat !== "Income")
    .map(([cat, v]) => ({ cat, v }))
    .sort((a, b) => b.v - a.v);

  const budgetMap = Object.fromEntries(props.budgets.map(b => [b.category, b.monthlyTarget]));

  return (
    <Card title={props.title}>
      {rows.length === 0 ? (
        <div className="muted">No spending data yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map(r => {
            const limit = budgetMap[r.cat] ?? 0;
            return (
              <div key={r.cat} style={{ display: "grid", gap: 6 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>{r.cat}</div>
                  <div style={{ fontWeight: 750 }}>{formatUSD(r.v)}</div>
                </div>
                {limit > 0 ? (
                  <>
                    <Progress value={r.v} max={limit} />
                    <div className="muted small">Target: {formatUSD(limit)}</div>
                  </>
                ) : (
                  <div className="muted small">No target set (optional).</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
