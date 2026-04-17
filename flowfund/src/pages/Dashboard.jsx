import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

/**
 * FlowFundAI Dashboard (PowerBI-inspired)
 * Theme: Grey + Blue
 * - KPI cards
 * - Spending trend line chart
 * - Category breakdown bar chart
 * - Slicers (filters): date range + category
 * - AI Insights feed (placeholder)
 */
export default function Dashboard() {
  // --- Mock data (swap with your real data later) ---
  const rawTrend = useMemo(
    () => [
      { date: "Dec 01", spend: 24 },
      { date: "Dec 03", spend: 18 },
      { date: "Dec 05", spend: 42 },
      { date: "Dec 07", spend: 16 },
      { date: "Dec 09", spend: 55 },
      { date: "Dec 11", spend: 28 },
      { date: "Dec 13", spend: 31 },
      { date: "Dec 15", spend: 62 },
      { date: "Dec 17", spend: 21 },
      { date: "Dec 19", spend: 44 },
      { date: "Dec 21", spend: 38 },
      { date: "Dec 23", spend: 70 },
      { date: "Dec 25", spend: 26 },
      { date: "Dec 27", spend: 33 },
      { date: "Dec 29", spend: 49 },
    ],
    []
  );

  const rawCategories = useMemo(
    () => [
      { category: "Rent", amount: 1200 },
      { category: "Food", amount: 410 },
      { category: "Transport", amount: 160 },
      { category: "Subscriptions", amount: 68 },
      { category: "Shopping", amount: 240 },
      { category: "School", amount: 95 },
    ],
    []
  );

  // --- Filters (PowerBI slicers vibe) ---
  const [range, setRange] = useState("30d"); // 7d | 30d | 90d
  const [categoryFilter, setCategoryFilter] = useState("All");

  // In a real app, range would change the query/window. Here we just simulate.
  const trendData = useMemo(() => {
    if (range === "7d") return rawTrend.slice(-4);
    if (range === "90d") return rawTrend; // placeholder
    return rawTrend.slice(-10);
  }, [range, rawTrend]);

  const categories = useMemo(() => {
    if (categoryFilter === "All") return rawCategories;
    return rawCategories.filter((c) => c.category === categoryFilter);
  }, [categoryFilter, rawCategories]);

  // --- KPIs ---
  const totalSpend = useMemo(
    () => categories.reduce((sum, c) => sum + c.amount, 0),
    [categories]
  );

  const budget = 2500; // placeholder
  const budgetLeft = Math.max(budget - totalSpend, 0);
  const burnRate = useMemo(() => {
    // simple estimate: average of trend points
    if (!trendData.length) return 0;
    const avg = trendData.reduce((s, d) => s + d.spend, 0) / trendData.length;
    return Math.round(avg);
  }, [trendData]);

  const projectedEndOfMonth = useMemo(() => {
    // naive projection: burnRate * 30
    return burnRate * 30;
  }, [burnRate]);

  // --- AI Insights (placeholder feed) ---
  const insights = useMemo(
    () => [
      {
        title: "Spending Spike Detected",
        body: "Your spending peaks around weekends. If you cap weekend spend by $20, you can save ~$80/month.",
      },
      {
        title: "Subscriptions Check",
        body: "Subscriptions are small individually, but add up. Review recurring charges and consider pausing 1–2.",
      },
      {
        title: "Budget Risk",
        body: projectedEndOfMonth > budget
          ? "You’re trending above budget this month. Tighten discretionary categories for the next 7 days."
          : "You’re on track to stay within budget. Keep consistent and watch impulse buys.",
      },
    ],
    [projectedEndOfMonth]
  );

  return (
    <div className="ff-page">
      {/* Top Bar */}
      <header className="ff-topbar">
        <div className="ff-brand">
          <div className="ff-logo">FF</div>
          <div>
            <div className="ff-title">FlowFundAI</div>
            <div className="ff-subtitle">Dashboard</div>
          </div>
        </div>

        {/* Slicers */}
        <div className="ff-controls">
          <div className="ff-control">
            <label className="ff-label">Range</label>
            <select
              className="ff-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div className="ff-control">
            <label className="ff-label">Category</label>
            <select
              className="ff-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All</option>
              {rawCategories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          <button className="ff-btnPrimary" onClick={() => alert("Hook up export later!")}>
            Export
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <section className="ff-kpis">
        <KpiCard label="Total Spend" value={`$${formatMoney(totalSpend)}`} hint="Selected window" />
        <KpiCard label="Budget Left" value={`$${formatMoney(budgetLeft)}`} hint={`Budget: $${formatMoney(budget)}`} />
        <KpiCard label="Burn Rate" value={`$${formatMoney(burnRate)}/day`} hint="Avg daily spend" />
        <KpiCard label="Projected (30d)" value={`$${formatMoney(projectedEndOfMonth)}`} hint="Simple forecast" />
      </section>

      {/* Main Grid */}
      <section className="ff-grid">
        {/* Trend */}
        <div className="ff-card ff-cardLarge">
          <div className="ff-cardHeader">
            <div>
              <div className="ff-cardTitle">Spending Trend</div>
              <div className="ff-cardMeta">Track how spend changes over time</div>
            </div>
            <div className="ff-pill">Live</div>
          </div>

          <div className="ff-chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke="#2a6df4"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="ff-card">
          <div className="ff-cardHeader">
            <div>
              <div className="ff-cardTitle">Category Breakdown</div>
              <div className="ff-cardMeta">Where your money actually goes</div>
            </div>
          </div>

          <div className="ff-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#2a6df4" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="ff-card ff-cardWide">
          <div className="ff-cardHeader">
            <div>
              <div className="ff-cardTitle">AI Insights</div>
              <div className="ff-cardMeta">Actionable recommendations (FlowFundAI edge)</div>
            </div>
            <button className="ff-btnGhost" onClick={() => alert("Hook up refresh insights later!")}>
              Refresh
            </button>
          </div>

          <div className="ff-insights">
            {insights.map((i) => (
              <div key={i.title} className="ff-insightItem">
                <div className="ff-insightDot" />
                <div>
                  <div className="ff-insightTitle">{i.title}</div>
                  <div className="ff-insightBody">{i.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions preview (optional) */}
        <div className="ff-card ff-cardWide">
          <div className="ff-cardHeader">
            <div>
              <div className="ff-cardTitle">Transactions Preview</div>
              <div className="ff-cardMeta">Quick look (wire this to your real transaction table later)</div>
            </div>
          </div>

          <div className="ff-tableWrap">
            <table className="ff-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th className="ff-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dec 29</td>
                  <td>Target</td>
                  <td>Shopping</td>
                  <td className="ff-right">$49.12</td>
                </tr>
                <tr>
                  <td>Dec 27</td>
                  <td>Uber Eats</td>
                  <td>Food</td>
                  <td className="ff-right">$23.88</td>
                </tr>
                <tr>
                  <td>Dec 25</td>
                  <td>Spotify</td>
                  <td>Subscriptions</td>
                  <td className="ff-right">$10.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

/** --- Components --- */
function KpiCard({ label, value, hint }) {
  return (
    <div className="ff-kpi">
      <div className="ff-kpiLabel">{label}</div>
      <div className="ff-kpiValue">{value}</div>
      <div className="ff-kpiHint">{hint}</div>
    </div>
  );
}

/** --- Helpers --- */
function formatMoney(n) {
  // Keep it simple + readable
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}
