\# FlowFundAI Test Plan



\## Auth Tests

\- Register a new user.

\- Confirm successful registration redirects to `/dashboard`.

\- Log out.

\- Log in with the same account.

\- Confirm login redirects to `/dashboard`.

\- While logged out, manually visit `/dashboard`.

\- Confirm the app redirects to `/login`.

\- While logged out, manually visit `/settings`.

\- Confirm the app redirects to `/login`.



\## Settings / Privacy Tests

\- Log in and visit `/settings`.

\- Confirm username, user ID, and account creation time display.

\- Confirm Back to Dashboard works.

\- Confirm Logout from Settings works.

\- Confirm the Privacy section is visible.

\- Confirm the Documents section is visible.



\## Transaction Persistence Tests

\- Log in as User A.

\- Add a transaction.

\- Refresh the page.

\- Confirm the transaction still appears.

\- Log out.

\- Log back in as User A.

\- Confirm the transaction still appears.



\## User Data Separation Tests

\- Log in as User A.

\- Add a transaction.

\- Log out.

\- Log in as User B.

\- Confirm User A's transaction does not appear.

\- Try deleting or fetching a transaction created by another user.

\- Confirm the request is blocked or returns not found.



\## Transaction CRUD Tests

\- Add a transaction with a valid description, category, amount, and date.

\- Confirm it appears in the transaction list.

\- Delete the transaction.

\- Confirm it disappears from the list.

\- Confirm dashboard totals update after add/delete.

\- Confirm category breakdown updates after add/delete.



\## Edge Case Tests

\- Try adding a transaction with an empty description.

\- Try adding a transaction with amount `0`.

\- Try adding a transaction with a negative amount.

\- Try adding a very large amount.

\- Try adding duplicate transactions.

\- Try deleting the same transaction twice.



\## Document Upload / Privacy Tests

\- Upload a demo bank statement.

\- Confirm extracted transactions belong only to the current user.

\- Log out and log in as another user.

\- Confirm uploaded/extracted data from the first user is not visible.

\- Confirm uploaded files and API keys are not committed to GitHub.



\## Demo Readiness Tests

\- Start backend.

\- Start frontend.

\- Register or log in.

\- Show dashboard.

\- Show settings/privacy page.

\- Add transaction.

\- Show totals/category update.

\- Delete transaction.

\- Log out and log back in.

\- Confirm data persisted.

