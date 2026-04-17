export type Route = "home" | "spending" | "plan" | "insights" | "settings";

export default function Nav(props: { route: Route; setRoute: (r: Route) => void }) {
  const items: { key: Route; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "spending", label: "Spending" },
    { key: "plan", label: "Plan" },
    { key: "insights", label: "Insights" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="row" style={{ marginBottom: 14 }}>
      {items.map(it => {
        const active = props.route === it.key;
        return (
          <button
            key={it.key}
            onClick={() => props.setRoute(it.key)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: `1px solid ${active ? "rgba(96,165,250,0.55)" : "rgba(255,255,255,0.10)"}`,
              background: active ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.04)",
              cursor: "pointer"
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
