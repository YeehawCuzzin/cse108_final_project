import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 32,
        background:
          "radial-gradient(900px 600px at 10% 10%, rgba(42,109,244,0.15), transparent 55%), #0b1220",
        color: "white",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 8 }}>
          FlowFundAI
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: 620 }}>
          AI-powered financial intelligence. Track spending, understand habits,
          and get actionable insights — not just charts.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: 20,
            padding: "12px 18px",
            borderRadius: 12,
            border: "1px solid #2a6df4",
            background: "#2a6df4",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Go to Dashboard →
        </button>

        {/* Preview Section */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
            What you’ll see inside
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            <PreviewCard
              title="Total Spend"
              value="$2,173"
              subtitle="This month"
            />
            <PreviewCard
              title="Budget Left"
              value="$327"
              subtitle="Out of $2,500"
            />
            <PreviewCard
              title="Burn Rate"
              value="$72/day"
              subtitle="Avg spend"
            />
            <PreviewCard
              title="AI Insight"
              value="⚠️"
              subtitle="Weekend spikes detected"
            />
          </div>
        </section>

        {/* Value bullets */}
        <section style={{ marginTop: 42 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            <ValuePoint
              title="PowerBI-style analytics"
              body="Clean KPIs, trends, and category breakdowns — consumer-friendly and fast."
            />
            <ValuePoint
              title="AI, not just visuals"
              body="FlowFundAI explains why you’re spending and what to do next."
            />
            <ValuePoint
              title="Built for action"
              body="Forecasts, alerts, and recommendations — not static charts."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------ Small Components ------------------ */

function PreviewCard({ title, value, subtitle }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          marginTop: 6,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function ValuePoint({ title, body }) {
  return (
    <div>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
        {body}
      </div>
    </div>
  );
}
