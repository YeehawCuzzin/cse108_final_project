# FlowFundAI  
### AI-Powered Budgeting and Financial Assistant

---

## Overview

FlowFundAI is a personal finance tracking application designed to help users track their finances and make informed financial decisions through the use of an integrated AI assistant. Users can log transactions manually or import them directly from PDF bank statements using Google Gemini 2.5 Flash.

An integrated AI assistant named Pluto, powered by Claude Sonnet, answers natural language questions about spending using the user's real transaction history and any uploaded financial documents as context.

---

## Purpose

Traditional budgeting tools display raw numbers without meaningful context. FlowFundAI addresses this by pairing transaction tracking with Pluto, an AI assistant that can answer plain-language questions about your finances, reference specific categories and amounts from your history, and suggest concrete ways to reduce spending.

The platform is designed to simplify financial decision-making by turning complex data into clear, actionable insights.
---

## Who It Helps

FlowFundAI is built to support a wide range of users, including:

- Students managing limited budgets and day-to-day expenses
- Young professionals working to build consistent saving habits
- Individuals who want to import bank statements and understand their spending without manual data entry
- Anyone who prefers asking questions about their finances in plain language rather than reading charts alone

---

## Key Features

- Manual transaction entry with category tagging (Food, Transport, Housing, Entertainment, Health, Shopping, Education, Subscriptions, Other)
- PDF bank statement import: Gemini 2.5 Flash automatically parses and categorizes debit transactions
- Dashboard with cash flow chart, category breakdown, and recent transaction summary
- Pluto AI assistant: answers questions using your actual transaction data and conversation history
- Document context upload: attach PDF, TXT, or MD files to give Pluto additional financial context (account summaries, goals, statements)
- Per-user data isolation with JWT authentication and bcrypt password hashing

---

## How It Works

1. Create an account and log in
2. Add transactions manually on the Transactions page, or import from a PDF bank statement on the Imports page
3. Optionally upload financial documents (PDF, TXT, MD) to give Pluto additional context about your accounts or goals
4. Ask Pluto questions in the chat rail, it answers using your real transaction history and any uploaded documents
5. Review your Dashboard for a visual summary of spending trends, category totals, and recent activity

---

## Value Proposition

FlowFundAI acts as a financial assistant rather than a static dashboard. Instead of manually interpreting charts, users can ask Pluto direct questions "What did I spend most on this month?" or "How could I trim dining costs?" and receive specific, data-backed answers drawn from their own transaction history.

---

## Current Tech Stack

FlowFundAI currently uses a React/Vite frontend with a Flask API backend.

- React
- Vite
- Mantine UI
- Flask
- Flask-SQLAlchemy
- SQLite
- Flask-JWT-Extended
- bcrypt password hashing
- python-dotenv

---

## Setup & Running the Project

### 1. Backend Setup

From the project root:

    cd C:\Users\Krish\source\repos\cse108_final_project
    py -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r backend\requirements.txt

Start the backend API:

    cd backend
    $env:FLASK_APP="app:create_app"
    flask run --port 5001

The backend API runs at:

    http://127.0.0.1:5001

Note: opening the backend root URL directly may show `404 Not Found`. This is expected because the backend mainly serves API routes.

---

### 2. Frontend Setup

Open a second PowerShell terminal.

From the project root:

    cd C:\Users\Krish\source\repos\cse108_final_project\frontend
    npm install
    npm run dev

The frontend runs at:

    http://localhost:5173

Use this URL in the browser.

---

## Useful Local URLs

| Page | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Register | `http://localhost:5173/register` |
| Login | `http://localhost:5173/login` |
| Dashboard | `http://localhost:5173/dashboard` |
| Settings | `http://localhost:5173/settings` |
| Backend API | `http://127.0.0.1:5001` |

---

## Current Verified Features

- User registration, login, and logout
- JWT-based authentication with bcrypt password hashing
- Protected dashboard, transactions, imports, and settings routes
- Manual transaction entry and deletion
- PDF bank statement import via Gemini 2.5 Flash
- Spending dashboard with cash flow chart, category breakdown, and recent transactions
- Pluto AI chat assistant (Claude Sonnet) with conversation history and transaction context
- Document context upload and clear (PDF, TXT, MD) for Pluto
- Per-user data isolation across all features

---

## Authentication Notes

The current app uses username/password authentication. Passwords are hashed with bcrypt on the backend. After login or registration, the backend returns a JWT token, which the frontend stores locally and uses for protected API requests.

---

## Gemini API / AI Features

PDF bank statement import and document context extraction use Google Gemini 2.5 Flash. The Pluto AI assistant uses the Anthropic Claude Sonnet API.

To use Gemini-powered features, create a `.env` file for the backend and add your API key:

    GEMINI_API_KEY=your_key_here

Do not add quotes around the key.

> Note: The `.env` file is intentionally excluded from version control. Never commit it to git.

---

## Test Accounts

There are currently no required pre-seeded test accounts for the React/JWT version. Create a test account from:

    http://localhost:5173/register

Example local test account:

    Username: krish_test
    Password: password123

Do not use real financial information in demo accounts.

---

## Development Notes

- Do not commit `.env` files.
- Do not commit real uploaded financial documents.
- Use demo or synthetic bank statements only.
- Backend routes that handle user data should require authentication.
- User-specific database queries should filter by the logged-in user ID.

---

## Future Development

Planned enhancements include:

- Integration with banking APIs for automatic transaction sync
- QuickBooks integration
- Advanced analytics and predictive spending insights
- Expanded personalization of Pluto's recommendations
- Income handling to understanding monthly cash flow of user
- Mobile optimization and cross-platform accessibility