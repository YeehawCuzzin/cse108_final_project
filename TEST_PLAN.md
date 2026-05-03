# FlowFundAI Test Plan

This test plan tracks what has already been verified, what is partially complete, and what still needs to be tested before the final demo.

---

## Verified

### Auth Tests

- Register a new user.
- Confirm successful registration redirects to `/dashboard`.
- Log out.
- Log in with the same account.
- Confirm login redirects to `/dashboard`.
- While logged out, manually visit `/dashboard`.
- Confirm the app redirects to `/login`.
- While logged out, manually visit `/settings`.
- Confirm the app redirects to `/login`.

Status: Verified locally.

---

### Settings / Privacy Tests

- Log in and visit `/settings`.
- Confirm username, user ID, and account creation time display.
- Confirm Back to Dashboard works.
- Confirm Logout from Settings works.
- Confirm the Privacy section is visible.
- Confirm the Documents section is visible.

Status: Verified locally.

---

### Backend Health Route Test

- Start the backend.
- Visit `/api/health`.
- Confirm the backend returns a working status message.

Expected result:

    {
      "message": "FlowFundAI backend is running",
      "status": "ok"
    }

Status: Verified locally.

---

### Transaction API CRUD Tests

- Create a transaction with a valid description, category, amount, and date.
- Fetch transactions for the logged-in user.
- Confirm the created transaction appears.
- Delete the transaction.
- Fetch transactions again.
- Confirm the deleted transaction no longer appears.

Status: Verified locally at the backend API level.

---

### User Data Separation Tests

- Log in as User A.
- Add a transaction as User A.
- Log out or switch tokens.
- Log in as User B.
- Fetch User B's transactions.
- Confirm User A's transaction does not appear.
- Try deleting User A's transaction while authenticated as User B.
- Confirm the request is blocked or returns not found.

Expected blocked delete result:

    {"error":"Transaction not found"}

Status: Verified locally at the backend API level.

---

## Partially Complete

### Transaction Persistence Tests

- Log in as User A.
- Add a transaction.
- Refresh or re-fetch transactions.
- Confirm the transaction still appears.
- Log out.
- Log back in as User A.
- Confirm the transaction still appears.

Status: Partially complete.

Notes:
- Transaction persistence exists at the backend API/database level.
- Transactions can be created, fetched, and deleted through protected API routes.
- Full browser-level persistence testing is still pending because the React frontend does not yet have a transaction UI connected to the API.

---

### Transaction CRUD UI Tests

- Add a transaction from the frontend.
- Confirm it appears in the frontend transaction list.
- Delete the transaction from the frontend.
- Confirm it disappears from the frontend transaction list.
- Confirm dashboard totals update after add/delete.
- Confirm category breakdown updates after add/delete.

Status: Partially complete.

Notes:
- Backend transaction CRUD is working.
- Frontend transaction UI is still pending or not yet connected on `main`.

---

## Pending

### Budget CRUD Tests

- Add a budget/category.
- View budget progress.
- Delete a budget.
- Confirm category totals update.
- Confirm users only see their own budgets.

Status: Pending.

Notes:
- Budget model/routes/UI still need to be implemented or pushed to `main`.

---

### Dashboard Totals / Category Breakdown Tests

- Confirm total spending updates after adding a transaction.
- Confirm total spending updates after deleting a transaction.
- Confirm number of transactions updates correctly.
- Confirm category breakdown updates correctly.
- Confirm pie chart or category summary matches transaction data.
- Confirm percentages display correctly.

Status: Pending.

Notes:
- Backend transaction data exists.
- React dashboard still needs transaction summary/category breakdown integration.

---

### Edge Case Tests

- Try adding a transaction with an empty description.
- Try adding a transaction with amount `0`.
- Try adding a transaction with a negative amount.
- Try adding a non-numeric amount.
- Try adding a very large amount.
- Try adding duplicate transactions.
- Try deleting the same transaction twice.
- Try accessing transaction routes without a JWT token.
- Try accessing transaction routes with an invalid JWT token.

Status: Pending.

Notes:
- Some validation exists in the backend transaction route.
- These cases still need full documented testing.

---

### Document Upload / Privacy Tests

- Upload a demo bank statement.
- Confirm extracted transactions belong only to the current user.
- Log out and log in as another user.
- Confirm uploaded/extracted data from the first user is not visible.
- Confirm uploaded files are not committed to GitHub.
- Confirm API keys are stored in `.env` and not committed.
- Confirm real financial documents are not used for demo data.

Status: Pending.

Notes:
- Document upload and Gemini parsing features are planned or in progress.
- Privacy testing should happen after upload routes are available on `main`.

---

### AI Assistant Tests

- Ask the AI assistant for spending advice.
- Confirm it uses the current user's financial data only.
- Confirm it does not expose another user's transactions.
- Confirm it gives useful budgeting recommendations.
- Confirm the UI labels the assistant honestly if it is rule-based or prototype-level.

Status: Pending.

Notes:
- AI assistant integration is still pending or not yet available on `main`.

---

### Demo Readiness Tests

- Start backend.
- Start frontend.
- Register or log in.
- Show dashboard.
- Show settings/privacy page.
- Add transaction.
- Show totals/category update.
- Delete transaction.
- Log out.
- Log back in.
- Confirm data persisted.
- Demonstrate user-data separation.
- Demonstrate document/upload privacy if upload feature is ready.
- Demonstrate AI assistant or rule-based insight box if ready.

Status: Pending.

Notes:
- Auth, settings, backend health, transaction API, and user-data separation are verified.
- Full demo flow still depends on frontend transaction UI, dashboard summaries, budgets, document upload, and AI assistant features.