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

## Future Development

Planned enhancements include:

- Integration with banking APIs
- Advanced analytics and predictive insights
- Expanded personalization of AI recommendations
- Mobile optimization and cross-platform accessibility

---

## Setup & Running the Project

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Get a Gemini API key

The PDF upload and AI context features are powered by Google Gemini 2.5 Flash. You need a free API key to use them.

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account
3. Click **Create API key**
4. Copy the key

### 3. Create a `.env` file

In the project root (same folder as `app.py`), create a file named `.env` with the following contents:

```
GEMINI_API_KEY=your_key_here
```

Replace `your_key_here` with the key you copied. Do not add quotes around it.

> **Note:** The `.env` file is intentionally excluded from version control. Never commit it to git.

### 4. Run the app

```bash
python app.py
```

Then open [http://localhost:5001](http://localhost:5001) in your browser.

### Test accounts (pre-seeded)

| Email | Password |
|---|---|
| roma@test.com | password123 |
| student@test.com | password123 |
| user@test.com | password123 |