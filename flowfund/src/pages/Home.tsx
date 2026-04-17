import { AppState } from "../lib/types";
import { computeSafeToSpend, formatUSD, monthKey, sumByCategory } from "../lib/moneyMath";
import Card from "../components/Card";
import Pill from "../components/Pill";
import MoneyFlow from "../components/MoneyFlow";
import BillsTimeline from "../components/BillsTimeline";
import CategoryBreakdown from "../components/CategoryBreakdown";
import AssistantBox from "../components/AssistantBox";

export default function Home(props: { state: AppState; nowISO: string }) {
  const safe = computeSafeToSpend(props.state, props.nowISO);
  const totals = sumByCategory(props.state.transactions, safe.month);

  // Derive components of the Money Flow (simple + explainable)
  const income = Math.abs(totals["Income"] ?? 0); // Income amounts are negative (money in)
  const fixed = props.state.bills.reduce((acc, b) => acc + b.amount, 0);
  const savings = totals["Savings"] ?? 0;

  // Variable spending = all non-fixed expense categories (excluding Savings)
  const variable = Object.entries(totals)
    .filter(([cat]) => cat !== "Income" && cat !== "Savings")
    .reduce((acc, [, v]) => acc + v, 0);

  const remaining = safe.netThisMonth - safe.billsTotal - safe.savingsRemaining;

  const tone = safe.safeToSpend >= 0 ? "good" : "bad";

  return (
    <div className="grid cols-2">
      <div className="grid">
        <Card title="Safe-to-Spend" right={<Pill label={tone === "good" ? "Stable" : "Risk"} tone={tone} />}>
          <div className="big">{formatUSD(safe.safeToSpend)}</div>
          <div className="muted small">
            Updated from month-to-date net ({formatUSD(safe.netThisMonth)}), upcoming bills ({formatUSD(safe.billsTotal)}),
            and remaining savings target ({formatUSD(safe.savingsRemaining)}).
          </div>
          <div className="hr" />
          <div className="muted small">
            Month: <b>{monthKey(props.nowISO)}</b> · Next pay: <b>{props.state.paycheck.nextPayDateISO}</b>
          </div>
        </Card>

        <MoneyFlow
          income={income}
          fixed={fixed}
          variable={variable}
          savings={savings}
          remaining={remaining}
        />

        <AssistantBox state={props.state} nowISO={props.nowISO} />
      </div>

      <div className="grid">
        <BillsTimeline bills={safe.billsDue.map(b => ({ name: b.name, dueISO: b.dueISO, amount: b.amount }))} />
        <CategoryBreakdown title="Spending this month (by category)" totals={totals} budgets={props.state.budgets} />
      </div>
    </div>
  );
}
