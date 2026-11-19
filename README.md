# Chat Backend Assignment

A 1:1 chat backend service built with Node.js, TypeScript, MySQL, and Firebase Firestore.

## Overview & Architecture

The application splits data between MySQL and Firestore based on use case:

- **MySQL:** Handles relational data — users, chats, and memberships.
  - A unique `pair_key` (`<smallerUserId>_<largerUserId>`) is used on the `chats` table to prevent duplicate chat creation and handle concurrent requests safely.
- **Firebase Firestore:** Handles chat messages, read receipts, and last-seen tracking.
  - Data structure:
    - `chats/{chatId}/messages/{messageId}` -> `{ senderId, text, createdAt }`
    - `chats/{chatId}/messages/{messageId}/readReceipts/{userId}` -> `{ userId, readAt }`
    - `chats/{chatId}/lastSeen/{userId}` -> `{ userId, messageId, updatedAt }`

## Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- Firebase project with Firestore enabled (or Firestore Emulator)

## Setup & Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the `.env.example` file:
```bash
cp .env.example .env
```
Update `.env` with your MySQL database details:
```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=chat_app
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 3. Firebase credentials
Place your Firebase Admin SDK service account key JSON file in the project root as `serviceAccountKey.json` (this file is ignored by git).

### 4. Database Setup & Seed Data
Run the SQL script to create the database, tables, and seed users (Alice `id: 1`, Bob `id: 2`, Charlie `id: 3`):
```bash
mysql -u root -p < sql/schema.sql
```

### 5. Run the application
- **Development mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production mode:**
  ```bash
  npm run build
  npm start
  ```
The server will run on `http://localhost:3000`.

## Testing

### Automated Tests (Jest)
To run the unit and integration tests:
```bash
npm test
```
This runs 24 test cases covering input validation (Zod), business logic (chatService), and API routes (Supertest).

### Postman Collection
A Postman collection is included in `postman/Chat-Backend.postman_collection.json`.

1. Import the collection into Postman.
2. Run the requests in order (**1 to 6**). Variables like `chatId` and `messageId` are automatically saved by the test scripts:
   - `1. Create or Get Chat`
   - `2. Send Message`
   - `3. Get Messages`
   - `4. Mark Message Read`
   - `5. Update Last Seen`
   - `6. List User Chats`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint |
| `POST` | `/chat/create` | Create a new chat or get existing chat between two users |
| `POST` | `/chat/:chatId/message/send` | Send a message to a chat |
| `GET` | `/chat/:chatId/messages?limit=50` | Get messages for a chat (oldest to newest) |
| `POST` | `/chat/:chatId/message/:messageId/read` | Mark a message as read |
| `POST` | `/chat/:chatId/lastseen` | Update last-seen message pointer |
| `GET` | `/user/:userId/chats` | List all chats for a given user |

## Project Structure

```
├── sql/
│   └── schema.sql              # Database schema & seed users
├── postman/
│   └── Chat-Backend.postman_collection.json # API tests
├── tests/
│   ├── api.test.ts             # Route & HTTP tests
│   ├── chatService.test.ts     # Business logic tests
│   └── schemas.test.ts         # Validation tests
├── src/
│   ├── config/                 # Database & Firebase setup
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Error handling
│   ├── repositories/           # Database queries
│   ├── routes/                 # API routes
│   ├── services/               # Business logic & Firestore calls
│   ├── types/                  # TypeScript interfaces
│   ├── utils/                  # Zod schemas & HTTP error classes
│   ├── app.ts                  # Express application setup
│   └── server.ts               # Server startup
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── tsconfig.json
```
