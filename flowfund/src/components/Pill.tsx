export default function Pill(props: { label: string; tone?: "neutral" | "good" | "warn" | "bad" }) {
    const tone = props.tone ?? "neutral";
    const border =
      tone === "good" ? "rgba(52,211,153,0.35)" :
      tone === "warn" ? "rgba(251,191,36,0.35)" :
      tone === "bad"  ? "rgba(251,113,133,0.35)" :
      "rgba(255,255,255,0.12)";
  
    const bg =
      tone === "good" ? "rgba(52,211,153,0.10)" :
      tone === "warn" ? "rgba(251,191,36,0.10)" :
      tone === "bad"  ? "rgba(251,113,133,0.10)" :
      "rgba(255,255,255,0.05)";
  
    return (
      <span style={{
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        color: "rgba(229,231,235,0.95)"
      }}>
        {props.label}
      </span>
    );
  }
  