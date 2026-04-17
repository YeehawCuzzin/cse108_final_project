export default function TopBar() {
    return (
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="h1">FlowFund</div>
          <div className="muted small">AI-powered budgeting + financial roadmap (MVP)</div>
        </div>
        <div className="row">
          <span className="kbd">Local demo</span>
        </div>
      </div>
    );
  }
  