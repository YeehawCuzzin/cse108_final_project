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



## 8. User Data Separation Test

This test confirms that one user cannot view or delete another user's transactions.

### User A: Register/Login

    $bodyA = @{
      username = "user_a_test"
      password = "password123"
    } | ConvertTo-Json

    try {
      $responseA = Invoke-RestMethod `
        -Uri "http://127.0.0.1:5001/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyA
    } catch {
      $responseA = Invoke-RestMethod `
        -Uri "http://127.0.0.1:5001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyA
    }

    $tokenA = $responseA.token
    $headersA = @{ Authorization = "Bearer $tokenA" }

### User A: Create a Private Transaction

    $transactionA = @{
      description = "User A private transaction"
      category = "Food"
      amount = 25.50
      date = "2026-05-03"
    } | ConvertTo-Json

    $createdA = Invoke-RestMethod `
      -Uri "http://127.0.0.1:5001/api/transactions" `
      -Method POST `
      -Headers $headersA `
      -ContentType "application/json" `
      -Body $transactionA

    $transactionIdA = $createdA.transaction.id
    $transactionIdA

### User B: Register/Login

    $bodyB = @{
      username = "user_b_test"
      password = "password123"
    } | ConvertTo-Json

    try {
      $responseB = Invoke-RestMethod `
        -Uri "http://127.0.0.1:5001/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyB
    } catch {
      $responseB = Invoke-RestMethod `
        -Uri "http://127.0.0.1:5001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyB
    }

    $tokenB = $responseB.token
    $headersB = @{ Authorization = "Bearer $tokenB" }

### User B: Fetch Transactions

    Invoke-RestMethod `
      -Uri "http://127.0.0.1:5001/api/transactions" `
      -Method GET `
      -Headers $headersB

Expected result:

    transactions
    ------------
    {}

User B should not see User A's transaction.

### User B: Try to Delete User A's Transaction

    Invoke-RestMethod `
      -Uri "http://127.0.0.1:5001/api/transactions/$transactionIdA" `
      -Method DELETE `
      -Headers $headersB

Expected result:

    {"error":"Transaction not found"}

This confirms that deletion checks both the transaction ID and the logged-in user's ID.



\## Notes



\- `GET /api/transactions` requires a valid JWT token.

\- `POST /api/transactions` requires a valid JWT token.

\- `DELETE /api/transactions/<id>` requires a valid JWT token.

\- Transactions are tied to the logged-in user ID.

\- Deleting a transaction checks both transaction ID and current user ID.

