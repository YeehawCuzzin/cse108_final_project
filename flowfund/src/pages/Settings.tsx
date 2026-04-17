import Card from "../components/Card";
import { AppState } from "../lib/types";
import { resetState } from "../lib/storage";
import { parseCSV } from "../lib/csv";

export default function Settings(props: { state: AppState; setState: (s: AppState) => void }) {
  function setFontScale(v: number) {
    props.setState({ ...props.state, ui: { ...props.state.ui, fontScale: v } });
  }

  async function onCSVUpload(file: File | null) {
    if (!file) return;
    const text = await file.text();
    const { rows, errors } = parseCSV(text);
    if (errors.length) alert(errors.slice(0, 5).join("\n"));
    if (!rows.length) return;

    props.setState({ ...props.state, transactions: [...rows, ...props.state.transactions] });
    alert(`Imported ${rows.length} transactions.`);
  }

  return (
    <div className="grid cols-2">
      <Card title="Accessibility">
        <div className="muted small" style={{ marginBottom: 10 }}>
          FlowFund is designed to be readable for all ages. Adjust as needed.
        </div>

        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700 }}>Font scale</div>
            <div className="muted small">Applies to the whole UI</div>
          </div>
          <select
            value={props.state.ui.fontScale}
            onChange={(e) => setFontScale(Number(e.target.value))}
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)"
            }}
          >
            <option value={0.9}>Small</option>
            <option value={1}>Normal</option>
            <option value={1.15}>Large</option>
            <option value={1.3}>Extra Large</option>
          </select>
        </div>
      </Card>

      <Card title="Data">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Import CSV</div>
            <div className="muted small">Columns: date, merchant, amount (optional category)</div>
          </div>

          <label style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            cursor: "pointer"
          }}>
            Upload
            <input
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => onCSVUpload(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="hr" />

        <button
          onClick={() => {
            resetState();
            window.location.reload();
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            cursor: "pointer"
          }}
        >
          Reset demo data
        </button>

        <div className="muted small" style={{ marginTop: 10 }}>
          Everything is stored locally in your browser for this MVP.
        </div>
      </Card>
    </div>
  );
}
