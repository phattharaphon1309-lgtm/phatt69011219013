# Security Specification for Thai Income/Expense Tracker

## Data Invariants
1. Users may ONLY read, create, update, and delete their own profile at `/users/{userId}` where `userId == request.auth.uid`.
2. Users may ONLY read, create, update, and delete transactions inside their own subcollection `/users/{userId}/transactions/{transactionId}` where `userId == request.auth.uid`.
3. In `/users/{userId}/transactions/{transactionId}`, the payload `userId` field MUST strictly match `request.auth.uid`.
4. Transaction `type` must be strictly `"income"` or `"expense"`.
5. Transaction `amount` must be a positive number (`> 0`).
6. Field lengths and types must be strictly enforced:
   - `category` is a non-empty string <= 60 characters.
   - `date` is a non-empty string matching YYYY-MM-DD format (<= 30 chars).
   - `note` if present must be string <= 500 characters.
7. Immutable fields: `userId`, `createdAt` cannot be changed on update.

## The Dirty Dozen Payloads (Must Be Rejected)
1. **Unauthenticated Read**: Attempting to read `/users/{otherUser}` or `/users/{otherUser}/transactions/{txId}` without login. -> REJECT
2. **Cross-User List**: Attempting to list transactions of another user `/users/{otherUser}/transactions`. -> REJECT
3. **Cross-User Write**: Attempting to write into `/users/{otherUser}/transactions/{txId}` as a different authenticated user. -> REJECT
4. **Forged User ID**: Authenticated as user A, creating a transaction in `/users/{userA}/transactions/{txId}` with `userId: "userB"`. -> REJECT
5. **Invalid Type Enum**: Setting `type: "loan"` or `type: "investment"` instead of "income" or "expense". -> REJECT
6. **Negative Amount**: Setting `amount: -500` or `amount: 0`. -> REJECT
7. **Amount Non-Numeric**: Setting `amount: "1000"` (string instead of number). -> REJECT
8. **Oversized String Injection**: Setting `note` with 20,000 characters (Denial of Wallet). -> REJECT
9. **Missing Required Fields**: Creating transaction without `category`, `date`, or `amount`. -> REJECT
10. **Ghost Fields Injection**: Sending unexpected arbitrary administrative keys like `{ isAdmin: true, bypass: true }`. -> REJECT
11. **Modifying Immutable Field**: Updating a transaction and attempting to alter `userId` or `createdAt`. -> REJECT
12. **ID Poisoning**: Using non-alphanumeric special character paths or path strings longer than 128 characters. -> REJECT
