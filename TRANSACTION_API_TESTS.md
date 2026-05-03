\# Transaction API Test Commands



These commands test the transaction API locally using PowerShell.



\## Prerequisites



Start the backend first:



&#x20;   cd C:\\Users\\Krish\\source\\repos\\cse108\_final\_project

&#x20;   .\\.venv\\Scripts\\Activate.ps1

&#x20;   cd backend

&#x20;   $env:FLASK\_APP="app:create\_app"

&#x20;   python -m flask run --port 5001



The backend should be running at:



&#x20;   http://127.0.0.1:5001



\## 1. Health Check



&#x20;   Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/health" `

&#x20;     -Method GET



Expected result:



&#x20;   status message

&#x20;   ------ -------

&#x20;   ok     FlowFundAI backend is running



\## 2. Register a Test User



Use a unique username if `transaction\_test` already exists.



&#x20;   $body = @{

&#x20;     username = "transaction\_test"

&#x20;     password = "password123"

&#x20;   } | ConvertTo-Json



&#x20;   $response = Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/auth/register" `

&#x20;     -Method POST `

&#x20;     -ContentType "application/json" `

&#x20;     -Body $body



&#x20;   $token = $response.token

&#x20;   $token



If the username already exists, log in instead:



&#x20;   $body = @{

&#x20;     username = "transaction\_test"

&#x20;     password = "password123"

&#x20;   } | ConvertTo-Json



&#x20;   $response = Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/auth/login" `

&#x20;     -Method POST `

&#x20;     -ContentType "application/json" `

&#x20;     -Body $body



&#x20;   $token = $response.token

&#x20;   $token



\## 3. Create Request Headers



&#x20;   $headers = @{

&#x20;     Authorization = "Bearer $token"

&#x20;   }



\## 4. Create a Transaction



&#x20;   $transaction = @{

&#x20;     description = "Grocery run"

&#x20;     category = "Food"

&#x20;     amount = 42.75

&#x20;     date = "2026-05-03"

&#x20;   } | ConvertTo-Json



&#x20;   Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/transactions" `

&#x20;     -Method POST `

&#x20;     -Headers $headers `

&#x20;     -ContentType "application/json" `

&#x20;     -Body $transaction



Expected result:



&#x20;   message

&#x20;   -------

&#x20;   Transaction created



\## 5. Fetch Transactions



&#x20;   Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/transactions" `

&#x20;     -Method GET `

&#x20;     -Headers $headers



Expected result:



&#x20;   transactions

&#x20;   ------------

&#x20;   {@{amount=42.75; category=Food; ...}}



\## 6. Delete a Transaction



First get the transaction ID:



&#x20;   $result = Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/transactions" `

&#x20;     -Method GET `

&#x20;     -Headers $headers



&#x20;   $id = $result.transactions\[0].id

&#x20;   $id



Then delete it:



&#x20;   Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/transactions/$id" `

&#x20;     -Method DELETE `

&#x20;     -Headers $headers



Expected result:



&#x20;   message

&#x20;   -------

&#x20;   Transaction deleted



\## 7. Confirm Transaction Was Deleted



&#x20;   Invoke-RestMethod `

&#x20;     -Uri "http://127.0.0.1:5001/api/transactions" `

&#x20;     -Method GET `

&#x20;     -Headers $headers



Expected result:



&#x20;   transactions

&#x20;   ------------

&#x20;   {}



\## Notes



\- `GET /api/transactions` requires a valid JWT token.

\- `POST /api/transactions` requires a valid JWT token.

\- `DELETE /api/transactions/<id>` requires a valid JWT token.

\- Transactions are tied to the logged-in user ID.

\- Deleting a transaction checks both transaction ID and current user ID.

