import Card from "./Card";
import { formatUSD, addDays, monthKey } from "../lib/moneyMath";
import { AppState } from "../lib/types";
import Pill from "./Pill";

/**
 * Roadmap (simple forecast):
 * - Uses this month's net + budget targets to estimate future months.
 * - Designed to be explainable, not perfect.
 */
export default function Roadmap(props: { state: AppState; nowISO: string }) {
  const month = monthKey(props.nowISO);

  // Net this month (proxy)
  const netThisMonth = props.state.transactions
    .filter(t => t.dateISO.startsWith(month))
    .reduce((acc, t) => acc + t.amount, 0);

  const savingsTarget = props.state.budgets.find(b => b.category === "Savings")?.monthlyTarget ?? 0;
  const variableTargets = props.state.budgets
    .filter(b => b.category !== "Savings")
    .reduce((acc, b) => acc + b.monthlyTarget, 0);

  const fixedBills = props.state.bills.reduce((acc, b) => acc + b.amount, 0);

  // Month projection: start from netThisMonth, then estimate upcoming months with paycheck - fixed - variable - savings
  const projectedMonthlyDelta = props.state.paycheck.typicalNetPay * (props.state.paycheck.cadence === "weekly" ? 4 :
    props.state.paycheck.cadence === "biweekly" ? 2 : 1)
    - fixedBills - variableTargets - savingsTarget;

  const points = [
    { label: "Today", iso: props.nowISO, delta: 0 },
    { label: "Next paycheck", iso: props.state.paycheck.nextPayDateISO, delta: 0 },
    { label: "End of month", iso: addDays(`${month}-01`, 32).slice(0,7) + "-01", delta: projectedMonthlyDelta * 0.6 },
    { label: "3 months", iso: addDays(props.nowISO, 90), delta: projectedMonthlyDelta * 3 },
    { label: "6 months", iso: addDays(props.nowISO, 180), delta: projectedMonthlyDelta * 6 },
    { label: "12 months", iso: addDays(props.nowISO, 365), delta: projectedMonthlyDelta * 12 },
  ];

  return (
    <Card title="Financial Roadmap" right={<Pill label="Forecast" />}>
      <div className="muted small" style={{ marginBottom: 10 }}>
        Explainable projection based on your targets + recurring bills (MVP model).
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {points.map(p => (
          <div key={p.label} className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{p.label}</div>
              <div className="muted small">{p.iso}</div>
            </div>
            <div style={{ fontWeight: 750 }}>
              {p.label === "Today" ? formatUSD(netThisMonth) : formatUSD(netThisMonth + p.delta)}
            </div>
          </div>
        ))}
      </div>

      <div className="hr" />
      <div className="muted small">
        Monthly projection driver (approx): {formatUSD(projectedMonthlyDelta)} / month
      </div>
    </Card>
  );
}
