import { AppState, Bill, Transaction, Category } from "./types";

export function formatUSD(n: number): string {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  return `${sign}$${v.toFixed(2)}`;
}

/**
 * Returns YYYY-MM (month key).
 */
export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

export function todayISO(): string {
  // MVP: uses device time
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function sumTransactions(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => acc + t.amount, 0);
}

export function sumByCategory(transactions: Transaction[], month: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of transactions) {
    if (monthKey(t.dateISO) !== month) continue;
    out[t.category] = (out[t.category] || 0) + t.amount;
  }
  return out;
}

/**
 * Converts a "bill with dueDay" into a specific due date for a month.
 * If month lacks that day (e.g., Feb 30), it clamps to last day of month.
 */
export function billDueDateISO(bill: Bill, year: number, month1to12: number): string {
  const lastDay = new Date(year, month1to12, 0).getDate();
  const day = Math.min(bill.dueDay, lastDay);
  const mm = String(month1to12).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function parseISO(dateISO: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateISO: string, days: number): string {
  const dt = parseISO(dateISO);
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isBeforeOrEqual(aISO: string, bISO: string): boolean {
  return parseISO(aISO).getTime() <= parseISO(bISO).getTime();
}

/**
 * Safe-to-Spend (simple + explainable):
 * currentBalance = income (negative amounts) + expenses (positive)
 * projectedBillsDueBeforeNextPay = sum(bills that fall before next pay date)
 * safeToSpend = currentBalance - projectedBills - plannedSavingsRemainder
 *
 * In a real product, you'd compute this from linked account balances.
 * For MVP, we infer a "balance proxy" from transactions.
 */
export function computeSafeToSpend(state: AppState, nowISO: string) {
  const currentMonth = monthKey(nowISO);
  const txThisMonth = state.transactions.filter(t => monthKey(t.dateISO) === currentMonth);

  // Proxy: net position this month
  const netThisMonth = sumTransactions(txThisMonth);

  // Bills due between now and next pay date (inclusive)
  const nextPay = state.paycheck.nextPayDateISO;
  const [y, m] = nowISO.split("-").map(Number);
  const billsDue: { name: string; amount: number; dueISO: string; category: Category }[] = [];
  for (const b of state.bills) {
    const dueISO = billDueDateISO(b, y, m);
    if (isBeforeOrEqual(nowISO, dueISO) && isBeforeOrEqual(dueISO, nextPay)) {
      billsDue.push({ name: b.name, amount: b.amount, dueISO, category: b.category });
    }
  }
  const billsTotal = billsDue.reduce((acc, x) => acc + x.amount, 0);

  // Savings target (monthly) minus savings already moved this month
  const savingsTarget = state.budgets.find(b => b.category === "Savings")?.monthlyTarget ?? 0;
  const savingsSoFar = txThisMonth
    .filter(t => t.category === "Savings")
    .reduce((acc, t) => acc + t.amount, 0);

  // Since savings transfers are expenses (positive), remaining = target - soFar
  const savingsRemaining = Math.max(0, savingsTarget - savingsSoFar);

  const safe = netThisMonth - billsTotal - savingsRemaining;

  return {
    month: currentMonth,
    netThisMonth,
    billsDue,
    billsTotal,
    savingsTarget,
    savingsSoFar,
    savingsRemaining,
    safeToSpend: safe,
  };
}
