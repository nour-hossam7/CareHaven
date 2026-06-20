# CareHaven

## Project Name

CareHaven

## Project Description

CareHaven is a donations platform that connects donors with NGO-led campaigns. It includes a static frontend and a Node.js/Express backend using MongoDB for authentication, campaign management, donations, and report metadata.

## Features

- Donor and NGO registration, login, and logout
- Role-based dashboards for donors and NGOs
- NGO approval workflow for admin users
- Campaign creation, listing, search, filtering, and details
- Donation recording with campaign progress updates
- NGO report upload metadata support
- Centralized backend validation and error handling

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Environment: dotenv
- Security: bearer tokens, PBKDF2 password hashing, CORS

## Folder Structure

```text
CareHaven/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
    package.json
    .env.example
  WebProject/
    donation-system/
      css/
      images/
      js/
      *.html
```

## Installation Steps

1. Open a terminal.
2. Navigate to the backend folder:

```bash
cd backend
```

3. Install backend dependencies:

```bash
npm install
```

4. Copy environment variables:

```bash
copy .env.example .env
```

5. Start the backend server:

```bash
npm run dev
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and update as needed:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/carehaven
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500
BODY_LIMIT=2mb
REPORT_MAX_BYTES=2097152
AUTH_TOKEN_TTL_HOURS=24
ADMIN_REGISTRATION_KEY=change-me-before-production
```

## MongoDB Setup

### Local MongoDB

Install MongoDB and run:

```bash
mongod
```

### MongoDB Atlas

1. Create an Atlas cluster.
2. Add a database user.
3. Allow your IP address in Network Access.
4. Set `MONGODB_URI` in `backend/.env`.

## How to Run the Project Locally

### Backend

```bash
cd backend
npm run dev
```

### Frontend

Open the static files from `WebProject/donation-system` in your browser, or use a simple static server such as Live Server.

## How to Run Backend

From the project root:

```bash
npm run backend:start
```

## How to Run Frontend

Open `WebProject/donation-system/index.html` or serve the folder using any static server.

## Default Test Accounts

No default accounts exist. Create a donor or NGO account using the registration page.

## Build Instructions

This project does not require a frontend build step. The backend runs with Node.js.

## Deployment Notes

- Set `MONGODB_URI` to a production database.
- Use a secure `ADMIN_REGISTRATION_KEY`.
- Use `npm start` for production backend deployment.

## Troubleshooting

### MongoDB Connection Error

Verify MongoDB is running and `MONGODB_URI` is correct in `backend/.env`.

### Port 5000 Already in Use (EADDRINUSE)

If you see `Error: listen EADDRINUSE: address already in use :::5000`, do one of the following:

**Option 1: Kill the old process**

```bash
taskkill /IM node.exe /F
```

Then restart:

```bash
cd backend
npm run dev
```

**Option 2: Use a different port**

Edit `backend/.env` and change `PORT` to an available port (e.g., 5001, 3000):

```env
PORT=5001
```

Then run:

```bash
cd backend
npm run dev
```

### Frontend Cannot Reach Backend

Confirm the backend is running at the correct port. Check the terminal output when starting `npm run dev` to see which port is being used.

### npm install Fails

Ensure Node.js 18+ is installed:

```bash
node --version
```

### CORS Errors

Update `CORS_ORIGIN` in `backend/.env` to match your frontend origin:

```env
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500
```

