export type Transaction = {
    id: string;
    dateISO: string;          // e.g., "2025-12-29"
    merchant: string;         // e.g., "Target"
    amount: number;           // positive = money out, negative = money in (income/refund)
    category: Category;
    notes?: string;
  };
  
  export type Category =
    | "Income"
    | "Housing"
    | "Utilities"
    | "Food"
    | "Transportation"
    | "Health"
    | "Personal"
    | "Fun"
    | "Subscriptions"
    | "Savings"
    | "Other";
  
  export type Bill = {
    id: string;
    name: string;
    dueDay: number;         // 1..31
    amount: number;         // positive expense
    category: Category;     // usually Housing/Utilities/Subscriptions/etc.
    autopay?: boolean;
  };
  
  export type BudgetTarget = {
    category: Category;
    monthlyTarget: number;  // positive limit (except Income)
  };
  
  export type AppState = {
    currency: "USD";
    paycheck: {
      cadence: "weekly" | "biweekly" | "monthly";
      nextPayDateISO: string;
      typicalNetPay: number;
    };
    bills: Bill[];
    budgets: BudgetTarget[];
    transactions: Transaction[];
    ui: {
      fontScale: 1; // accessibility setting (1 = normal)
    };
  };
  