# CareHaven Backend - Quick Start Guide

## Step-by-Step Setup

### 1️⃣ Prerequisites
- **Node.js** (v14+) - [Download](https://nodejs.org)
- **MongoDB** (local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Postman** (optional, for API testing) - [Download](https://www.postman.com/downloads)

### 2️⃣ Installation

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install
```

### 3️⃣ Configure Environment

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carehaven
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carehaven
```

### 4️⃣ Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Compass** (GUI) to connect to your local/cloud database

### 5️⃣ Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║   CareHaven Backend Server             ║
║   Running on Port: 5000                ║
║   Environment: development             ║
╚════════════════════════════════════════╝
```

---

## Testing the API

### Option 1: Using cURL (Command Line)

```bash
# Health check
curl http://localhost:5000/api/health

# Get all campaigns
curl http://localhost:5000/api/campaigns/all

# Get all NGOs
curl http://localhost:5000/api/ngos/all
```

### Option 2: Using Postman

1. Download and import the collection:
   - `File → Import → CareHaven_API.postman_collection.json`
2. Click on any request and modify the IDs/data as needed
3. Click **Send** to test

### Option 3: Using Thunder Client (VS Code Extension)

1. Install "Thunder Client" extension in VS Code
2. Create a new request
3. Use the endpoints from `API_DOCUMENTATION.md`

---

## File Structure Created

```
backend/
├── models/
│   ├── Campaign.js              ← Campaign data schema
│   ├── NGO.js                   ← NGO data schema
│   └── Admin.js                 ← Admin data schema
│
├── controllers/
│   ├── campaignController.js    ← Campaign logic
│   └── ngoController.js         ← NGO logic
│
├── routes/
│   ├── campaignRoutes.js        ← Campaign endpoints
│   └── ngoRoutes.js             ← NGO endpoints
│
├── config/
│   └── database.js              ← Database connection
│
├── utils/
│   └── validators.js            ← Input validation
│
├── server.js                    ← Main Express app
├── package.json                 ← Dependencies
├── .env                         ← Environment variables
├── .gitignore                   ← Git ignore file
├── README.md                    ← Full documentation
├── API_DOCUMENTATION.md         ← API reference
├── QUICK_START.md              ← This file
└── CareHaven_API.postman_collection.json ← Postman tests
```

---

## Common Tasks

### Task 1: Register an NGO

**Request:**
```bash
curl -X POST http://localhost:5000/api/ngos/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Help Foundation",
    "email": "help@foundation.org",
    "phone": "+923001234567",
    "registrationNumber": "NGO-2025-001",
    "description": "Helping communities in need"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "NGO registered successfully. Awaiting admin approval.",
  "ngo": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Pending",
    ...
  }
}
```

### Task 2: Approve an NGO (Admin)

**First get the NGO ID from the registration response above**

```bash
curl -X POST http://localhost:5000/api/ngos/admin/approve/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "ADMIN_ID_HERE"
  }'
```

### Task 3: Create a Campaign

**After NGO is approved:**

```bash
curl -X POST http://localhost:5000/api/campaigns/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Medical Fund",
    "description": "Help save lives through medical assistance",
    "ngoId": "507f1f77bcf86cd799439011",
    "targetAmount": 500000,
    "category": "Medical",
    "startDate": "2025-01-15",
    "endDate": "2025-03-31",
    "image": "https://example.com/image.jpg"
  }'
```

### Task 4: Get All Campaigns with Filters

```bash
# Get active medical campaigns
curl "http://localhost:5000/api/campaigns/all?status=Active&category=Medical&page=1&limit=10"
```

### Task 5: View Admin Dashboard Stats

```bash
curl http://localhost:5000/api/ngos/admin/statistics
```

---

## Database Schema Overview

### Campaigns Collection
- **title**: Campaign name
- **ngoId**: Reference to NGO
- **targetAmount**: Money goal
- **collectedAmount**: Money raised
- **status**: Active/Completed/Paused/Cancelled
- **category**: Medical/Education/Food/Shelter/Other
- **startDate & endDate**: Campaign duration

### NGOs Collection
- **name**: Organization name
- **email**: Unique email
- **status**: Pending/Approved/Rejected
- **registrationNumber**: Unique registration ID
- **approvedBy**: Admin who approved
- **rejectionReason**: Why rejected (if rejected)

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running (`mongod` in terminal)
- Check `MONGODB_URI` in `.env` file
- Verify connection string is correct

### Issue: "Port 5000 is already in use"
**Solution:**
```bash
# Kill the process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env to 5001
```

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Issue: "Validation errors on registration"
**Solution:**
- Phone format should be: `+923001234567` or `03001234567`
- Email must be unique
- All required fields must be provided

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

---

## Next Steps

1. ✅ **Verify Backend is Running** - Check `http://localhost:5000/api/health`
2. ✅ **Test Endpoints** - Use Postman collection or cURL commands
3. ✅ **Register NGOs** - Create test NGOs
4. ✅ **Create Campaigns** - Create test campaigns
5. ✅ **Connect Frontend** - Update frontend API calls to point to `http://localhost:5000/api`

---

## Frontend Integration

To connect your frontend to this backend:

**Example JavaScript/Fetch:**
```javascript
// Register NGO
fetch('http://localhost:5000/api/ngos/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'NGO Name',
    email: 'ngo@email.com',
    phone: '+923001234567',
    registrationNumber: 'NGO-2025-001'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Support & Documentation

- **Full API Docs**: See `API_DOCUMENTATION.md`
- **Database Models**: Check `models/` folder
- **Controllers**: Check `controllers/` folder
- **Routes**: Check `routes/` folder

---

**Happy Coding! 🚀**
