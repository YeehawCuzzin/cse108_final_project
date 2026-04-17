import { Category, Transaction } from "./types";
import { suggestCategory } from "./categorizer";

/**
 * MVP CSV importer:
 * Expected columns (any order):
 * - date (YYYY-MM-DD)
 * - merchant
 * - amount
 * Optional:
 * - category
 *
 * Notes:
 * - amount: positive = expense, negative = income
 */
export function parseCSV(text: string): { rows: Transaction[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], errors: ["CSV appears empty or missing headers."] };

  const header = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const idxDate = header.findIndex(h => h === "date" || h === "transaction date");
  const idxMerchant = header.findIndex(h => h === "merchant" || h === "description");
  const idxAmount = header.findIndex(h => h === "amount" || h === "transaction amount");
  const idxCategory = header.findIndex(h => h === "category");

  if (idxDate < 0 || idxMerchant < 0 || idxAmount < 0) {
    return { rows: [], errors: ["CSV must include columns: date, merchant, amount (case-insensitive)."] };
  }

  const rows: Transaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const dateISO = (cols[idxDate] ?? "").trim();
    const merchant = (cols[idxMerchant] ?? "").trim();
    const amountStr = (cols[idxAmount] ?? "").trim().replace("$", "");
    const amount = Number(amountStr);

    if (!dateISO || !merchant || Number.isNaN(amount)) {
      errors.push(`Row ${i + 1}: invalid date/merchant/amount`);
      continue;
    }

    const providedCat = idxCategory >= 0 ? (cols[idxCategory] ?? "").trim() : "";
    const auto = suggestCategory(merchant, amount);

    const category = (providedCat as Category) || auto.category;

    rows.push({
      id: `csv_${crypto.randomUUID()}`,
      dateISO,
      merchant,
      amount,
      category,
    });
  }

  return { rows, errors };
}

/**
 * Minimal CSV splitting that supports quoted fields.
 */
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' ) {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}
