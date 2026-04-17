import { useMemo, useState } from "react";
import Card from "./Card";
import Pill from "./Pill";
import { answerQuestion } from "../lib/assistant";
import { AppState } from "../lib/types";

export default function AssistantBox(props: { state: AppState; nowISO: string }) {
  const [q, setQ] = useState("");
  const result = useMemo(() => answerQuestion(props.state, props.nowISO, q), [props.state, props.nowISO, q]);

  return (
    <Card title="Ask FlowFund" right={<Pill label="Explainable AI" />}>
      <div className="muted small" style={{ marginBottom: 10 }}>
        Try: <span className="kbd">Can I afford $120?</span> or <span className="kbd">Why was this month tight?</span>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask a money question…"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.25)",
          outline: "none"
        }}
      />

      <div className="hr" />

      <div style={{ fontWeight: 800, marginBottom: 6 }}>{result.title}</div>
      <div style={{ marginBottom: 10 }}>{result.answer}</div>

      <div className="muted small" style={{ fontWeight: 700, marginBottom: 6 }}>Why:</div>
      <ul className="muted small" style={{ margin: 0, paddingLeft: 18 }}>
        {result.reasoning.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </Card>
  );
}
