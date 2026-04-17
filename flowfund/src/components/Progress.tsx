export default function Progress(props: { value: number; max: number }) {
    const pct = props.max <= 0 ? 0 : Math.max(0, Math.min(1, props.value / props.max));
    return (
      <div style={{
        height: 10,
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.10)",
        overflow: "hidden"
      }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: "rgba(96,165,250,0.75)" }} />
      </div>
    );
  }
  