import Card from "./Card";
import { formatUSD } from "../lib/moneyMath";
import Pill from "./Pill";

export default function BillsTimeline(props: { bills: { name: string; dueISO: string; amount: number }[] }) {
  return (
    <Card title="Upcoming Bills" right={<Pill label="Timeline" />}>
      {props.bills.length === 0 ? (
        <div className="muted">No bills due before the next paycheck.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {props.bills
            .slice()
            .sort((a, b) => a.dueISO.localeCompare(b.dueISO))
            .map(b => (
              <div key={`${b.name}-${b.dueISO}`} className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{b.name}</div>
                  <div className="muted small">Due {b.dueISO}</div>
                </div>
                <div style={{ fontWeight: 750 }}>{formatUSD(b.amount)}</div>
              </div>
            ))}
        </div>
      )}
    </Card>
  );
}
