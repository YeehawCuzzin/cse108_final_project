# FlowFundAI  
### AI-Powered Budgeting and Financial Assistant

---

## Overview  

FlowFundAI is a budgeting application designed to help users track their finances and make informed financial decisions through the use of an integrated AI assistant.  

Rather than simply displaying financial data, FlowFundAI analyzes spending patterns, provides real-time insights, and offers personalized recommendations to improve financial habits.

---

## Purpose  

Traditional budgeting tools often present raw data without meaningful guidance. FlowFundAI addresses this gap by combining financial tracking with intelligent analysis, enabling users to better understand and manage their money.  

The platform is designed to simplify financial decision-making by turning complex data into clear, actionable insights.

---

## Who It Helps  

FlowFundAI is built to support a wide range of users, including:  

- Students managing limited budgets and day-to-day expenses  
- Young professionals working to build consistent saving habits  
- Individuals seeking structured financial guidance  
- Users who want a more intuitive and interactive approach to budgeting  

---

## Key Features  

- Expense and income tracking  
- Categorization of transactions  
- AI-powered financial assistant for questions and guidance  
- Personalized recommendations for saving and spending  
- Automated budgeting workflows  
- Clear insights into financial behavior and trends  

---

## How It Works  

FlowFundAI combines data tracking with AI-driven analysis:  

1. Users input or connect financial data  
2. Transactions are categorized and analyzed  
3. The AI assistant interprets spending behavior  
4. Users receive insights, recommendations, and answers in real time  

---

## Value Proposition  

FlowFundAI goes beyond traditional budgeting tools by acting as a financial assistant rather than a static dashboard. It enables users to not only monitor their finances but also understand and improve them through intelligent support.

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

- User registration
- User login
- User logout
- JWT-based authentication
- Protected dashboard route
- Protected settings route
- Account/settings/privacy page

---

## Authentication Notes

The current app uses username/password authentication. Passwords are hashed with bcrypt on the backend. After login or registration, the backend returns a JWT token, which the frontend stores locally and uses for protected API requests.

---

## Gemini API / AI Features

The PDF upload, document parsing, and AI assistant features are planned to use Google Gemini 2.5 Flash.

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

- Integration with banking APIs
- QuickBooks integration
- Advanced analytics and predictive insights
- Expanded personalization of AI recommendations
- Full AI assistant integration
- Mobile optimization and cross-platform accessibility