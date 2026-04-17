import Card from "../components/Card";
import { AppState } from "../lib/types";
import { monthKey, sumByCategory, formatUSD } from "../lib/moneyMath";
import CategoryBreakdown from "../components/CategoryBreakdown";

export default function Spending(props: { state: AppState; nowISO: string }) {
  const month = monthKey(props.nowISO);
  const totals = sumByCategory(props.state.transactions, month);

  const tx = props.state.transactions
    .filter(t => monthKey(t.dateISO) === month && t.category !== "Income")
    .slice()
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));

  return (
    <div className="grid cols-2">
      <CategoryBreakdown title={`Category breakdown (${month})`} totals={totals} budgets={props.state.budgets} />

      <Card title="Transactions">
        <div className="muted small" style={{ marginBottom: 10 }}>
          Tap into this later for merchant filters, receipts, and notes.
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {tx.map(t => (
            <div key={t.id} className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{t.merchant}</div>
                <div className="muted small">{t.dateISO} · {t.category}</div>
              </div>
              <div style={{ fontWeight: 750 }}>{formatUSD(t.amount)}</div>
            </div>
          ))}
          {tx.length === 0 && <div className="muted">No transactions this month.</div>}
        </div>
      </Card>
    </div>
  );
}
