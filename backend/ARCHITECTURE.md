# CareHaven Backend Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (HTML/CSS/JS)                     │
│                    WebProject/donation-system/                   │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼──────────────────────────────────────────┐
│                   Express.js Server (Port 5000)                   │
│                          server.js                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                        │  │
│  │  • CORS • Body Parser • Error Handler • Request Logger    │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────┬──────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Routes     │  │   Routes     │  │   Health     │
│  Campaign    │  │    NGO       │  │   Check      │
│  Routes.js   │  │  Routes.js   │  │              │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                  │
       ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│  CONTROLLERS     │  │  CONTROLLERS     │
│                  │  │                  │
│  campaign        │  │  ngo             │
│  Controller.js   │  │  Controller.js   │
│                  │  │  (includes Admin)│
│ • Create         │  │ • Register       │
│ • Get All        │  │ • Get All        │
│ • Get by ID      │  │ • Get by ID      │
│ • Update         │  │ • Update         │
│ • Delete         │  │ • Approve ⭐     │
│ • Filter         │  │ • Reject ⭐      │
└──────┬───────────┘  │ • Statistics     │
       │              └─────────┬────────┘
       │                        │
       └────────────┬───────────┘
                    │
                    ▼
       ┌────────────────────────┐
       │    MONGOOSE LAYER      │
       │   (Data Validation)    │
       └────────────┬───────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │Campaign│ │  NGO   │ │ Admin  │
    │ Model  │ │ Model  │ │ Model  │
    │ .js    │ │  .js   │ │  .js   │
    └────┬───┘ └────┬───┘ └────┬───┘
         │          │          │
         └──────────┼──────────┘
                    │
                    ▼
       ┌────────────────────────┐
       │      MongoDB Database  │
       │   mongodb://localhost  │
       └────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌──────────┐
    │Campaigns│ │   NGOs  │ │  Admins  │
    │Collection│ │Collection│ │Collection│
    └─────────┘ └─────────┘ └──────────┘
```

---

## API Endpoint Hierarchy

```
/api/
├── /campaigns
│   ├── POST   /create              → Create campaign
│   ├── GET    /all                 → Get all campaigns
│   ├── GET    /:id                 → Get campaign by ID
│   ├── GET    /ngo/:ngoId          → Get campaigns by NGO
│   ├── PUT    /update/:id          → Update campaign
│   └── DELETE /delete/:id          → Delete campaign
│
├── /ngos
│   ├── POST   /register            → Register NGO
│   ├── GET    /all                 → Get all NGOs
│   ├── GET    /:id                 → Get NGO by ID
│   ├── PUT    /update/:id          → Update NGO details
│   │
│   └── /admin (NGO Approval System)
│       ├── GET    /pending         → Get pending approvals
│       ├── POST   /approve/:id     → ⭐ Approve NGO
│       ├── POST   /reject/:id      → ⭐ Reject NGO
│       └── GET    /statistics      → Get approval stats
│
└── /health                         → Server health check
```

---

## Data Flow: Creating a Campaign

```
Frontend User
    │
    ▼
┌─────────────────────────┐
│ Fill Campaign Form      │
│ - Title                 │
│ - Description           │
│ - Target Amount         │
│ - Category              │
│ - Start/End Dates       │
└────────┬────────────────┘
         │
         ▼
POST /api/campaigns/create
         │
         ▼
┌──────────────────────────┐
│ campaignController.js    │
│ createCampaign()         │
└────────┬─────────────────┘
         │
         ▼ Validate Input
┌──────────────────────────┐
│ Check:                   │
│ ✓ Required fields        │
│ ✓ Valid dates            │
│ ✓ Amount > 0             │
│ ✓ Valid category         │
└────────┬─────────────────┘
         │
         ▼ Create Document
┌──────────────────────────┐
│ Campaign.create()        │
│ Mongoose Model           │
└────────┬─────────────────┘
         │
         ▼ Save to DB
┌──────────────────────────┐
│ MongoDB:                 │
│ campaigns collection     │
│ New document created     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Response: 201 Created    │
│ {                        │
│  "success": true,        │
│  "campaign": {...}       │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
      Frontend
```

---

## Data Flow: Admin Approving NGO

```
Admin User
    │
    ▼
┌─────────────────────────────┐
│ View Pending NGOs            │
│ GET /api/ngos/admin/pending  │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ ngoController.js            │
│ getPendingNGOs()            │
└─────────┬───────────────────┘
          │
          ▼ Query DB
┌─────────────────────────────┐
│ Find all NGOs with          │
│ status: "Pending"           │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ Display List in Admin Panel │
│ - NGO Name                  │
│ - Email                     │
│ - Registration #            │
│ [Approve] [Reject]          │
└─────────┬───────────────────┘
          │
          ▼ Click Approve
POST /api/ngos/admin/approve/:ngoId
          │
          ▼
┌─────────────────────────────┐
│ ngoController.js            │
│ approveNGO()                │
└─────────┬───────────────────┘
          │
          ▼ Update Document
┌─────────────────────────────┐
│ Update NGO:                 │
│ - status: "Approved"        │
│ - approvedBy: adminId       │
│ - approvalDate: now()       │
└─────────┬───────────────────┘
          │
          ▼ Save to DB
┌─────────────────────────────┐
│ MongoDB: ngos collection    │
│ Document updated            │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ Response: 200 OK            │
│ {                           │
│  "success": true,           │
│  "message": "Approved",     │
│  "ngo": {...}               │
│ }                           │
└─────────┬───────────────────┘
          │
          ▼
      Admin Dashboard
      ✓ NGO Approved!
      Can now create campaigns
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         ADMINS                              │
│  _id | name | email | password | role | createdAt          │
└────────┬────────────────────────────────────────────────────┘
         │
         │ approves (one-to-many)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                          NGOS                               │
│ _id | name | email | phone | status | approvedBy | ...     │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ owns (one-to-many)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                       CAMPAIGNS                             │
│ _id | title | ngoId | targetAmount | category | status | ..│
└─────────────────────────────────────────────────────────────┘
```

---

## File Organization

```
backend/
│
├── Entry Point
│   └── server.js .................. Express app, routes setup
│
├── Models (Database Schemas)
│   ├── Campaign.js ............... Campaign schema
│   ├── NGO.js .................... NGO schema
│   └── Admin.js .................. Admin schema
│
├── Controllers (Business Logic)
│   ├── campaignController.js ..... Campaign operations
│   └── ngoController.js .......... NGO + Approval logic
│
├── Routes (API Endpoints)
│   ├── campaignRoutes.js ......... Campaign endpoints
│   └── ngoRoutes.js .............. NGO + Admin endpoints
│
├── Config
│   └── database.js ............... DB connection setup
│
├── Utils
│   └── validators.js ............. Input validation
│
├── Configuration
│   ├── package.json .............. Dependencies
│   ├── .env ....................... Environment vars
│   └── .gitignore ................ Git ignore rules
│
└── Documentation
    ├── START_HERE.md .............. Quick overview
    ├── README.md .................. Full documentation
    ├── QUICK_START.md ............. Setup guide
    ├── API_DOCUMENTATION.md ....... API reference
    ├── IMPLEMENTATION_SUMMARY.md .. What was built
    └── CareHaven_API.postman_collection.json .... Tests
```

---

## Request/Response Cycle

```
┌─────────────────┐
│   Frontend      │
│   (Browser)     │
└────────┬────────┘
         │
         │ HTTP Request
         │ GET /api/campaigns/all
         │
         ▼
┌──────────────────────────┐
│ server.js                │
│ app.listen(5000)         │
│ Receives request         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Middleware Stack         │
│ 1. CORS                  │
│ 2. Body Parser           │
│ 3. Error Handler         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ campaignRoutes.js        │
│ Match: GET /campaigns/all│
│ Route found ✓            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ campaignController.js    │
│ getAllCampaigns()        │
│ Execute logic            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Database Query           │
│ Campaign.find()          │
│ Mongoose ORM             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ MongoDB                  │
│ campaigns collection     │
│ Search & return docs     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Format Response          │
│ {                        │
│   success: true,         │
│   campaigns: [...],      │
│   pagination: {...}      │
│ }                        │
└────────┬─────────────────┘
         │
         │ HTTP Response
         │ 200 OK + JSON
         │
         ▼
┌─────────────────┐
│   Frontend      │
│   (Display Data)│
└─────────────────┘
```

---

## Authentication Flow (Future - To Be Added)

```
User Login
    │
    ▼
POST /api/auth/login
    │
    ▼
Validate Credentials
    │
    ├─ Invalid ──→ 401 Unauthorized
    │
    └─ Valid ──→ Generate JWT Token
                 │
                 ▼
             Return Token to Frontend
                 │
                 ▼
         Frontend stores in localStorage
                 │
                 ▼
    Subsequent requests include token
    Authorization: Bearer <token>
                 │
                 ▼
    Backend verifies token
         │
         ├─ Invalid ──→ 403 Forbidden
         │
         └─ Valid ──→ Process request
```

---

## Error Handling Flow

```
Request comes in
    │
    ▼
Validation Check
    │
    ├─ Missing Fields
    │  ├─→ 400 Bad Request
    │  └─→ Error Message
    │
    ├─ Invalid Format
    │  ├─→ 400 Bad Request
    │  └─→ Error Message
    │
    └─ Valid ──→ Continue
                 │
                 ▼
         Database Operation
                 │
                 ├─ Not Found
                 │  ├─→ 404 Not Found
                 │  └─→ Error Message
                 │
                 ├─ Duplicate Entry
                 │  ├─→ 400 Bad Request
                 │  └─→ Error Message
                 │
                 ├─ Connection Error
                 │  ├─→ 500 Server Error
                 │  └─→ Error Message
                 │
                 └─ Success ──→ Process
                               │
                               ▼
                         Format Response
                               │
                               ▼
                        Send to Frontend
```

---

**Architecture Version:** 1.0  
**Created:** December 17, 2025
