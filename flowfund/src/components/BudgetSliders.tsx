import Card from "./Card";
import { BudgetTarget, Category } from "../lib/types";
import { formatUSD } from "../lib/moneyMath";

/**
 * Slider-based budgets = accessible for all ages.
 * No typing required (but you can add it later).
 */
const SLIDER_CATS: Category[] = ["Food","Transportation","Fun","Personal","Health","Subscriptions","Savings"];

export default function BudgetSliders(props: {
  budgets: BudgetTarget[];
  onChange: (next: BudgetTarget[]) => void;
}) {
  const map = new Map(props.budgets.map(b => [b.category, b.monthlyTarget]));

  function setCat(cat: Category, value: number) {
    const next = SLIDER_CATS.map(c => ({
      category: c,
      monthlyTarget: c === cat ? value : (map.get(c) ?? 0),
    }));
    props.onChange(next);
  }

  return (
    <Card title="Budget Sliders">
      <div className="muted small" style={{ marginBottom: 10 }}>
        Drag to set flexible monthly targets. FlowFund uses these to guide your roadmap + safe-to-spend.
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {SLIDER_CATS.map(cat => {
          const v = map.get(cat) ?? 0;
          const max = cat === "Savings" ? 1500 : 1000;
          return (
            <div key={cat} style={{ display: "grid", gap: 6 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{cat}</div>
                <div style={{ fontWeight: 750 }}>{formatUSD(v)}</div>
              </div>
              <input
                type="range"
                min={0}
                max={max}
                step={10}
                value={v}
                onChange={(e) => setCat(cat, Number(e.target.value))}
              />
              <div className="muted small">0 → {formatUSD(max)}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
