# CareHaven Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Campaign APIs

### 1. Create Campaign
- **Endpoint:** `POST /campaigns/create`
- **Description:** Create a new campaign
- **Request Body:**
```json
{
  "title": "Medical Emergency Fund",
  "description": "Help us save lives through medical assistance",
  "ngoId": "NGO_ID_HERE",
  "targetAmount": 50000,
  "category": "Medical",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "image": "image_url_here"
}
```
- **Response:** 201 Created
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaign": { ... }
}
```

### 2. Get All Campaigns
- **Endpoint:** `GET /campaigns/all`
- **Query Parameters:**
  - `status` (optional): Active, Completed, Paused, Cancelled
  - `category` (optional): Medical, Education, Food, Shelter, Other
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
- **Example:** `GET /campaigns/all?status=Active&page=1&limit=10`
- **Response:** 200 OK
```json
{
  "success": true,
  "campaigns": [ ... ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### 3. Get Campaign by ID
- **Endpoint:** `GET /campaigns/:id`
- **Description:** Get details of a specific campaign
- **Response:** 200 OK
```json
{
  "success": true,
  "campaign": { ... }
}
```

### 4. Get Campaigns by NGO ID
- **Endpoint:** `GET /campaigns/ngo/:ngoId`
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
- **Response:** 200 OK

### 5. Update Campaign
- **Endpoint:** `PUT /campaigns/update/:id`
- **Request Body:** (Any fields to update)
```json
{
  "title": "Updated Title",
  "status": "Paused",
  "collectedAmount": 25000
}
```
- **Response:** 200 OK

### 6. Delete Campaign
- **Endpoint:** `DELETE /campaigns/delete/:id`
- **Response:** 200 OK
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

---

## NGO Management APIs

### 1. Register NGO
- **Endpoint:** `POST /ngos/register`
- **Description:** Register a new NGO (Status will be 'Pending' until approved)
- **Request Body:**
```json
{
  "name": "Help Foundation",
  "email": "help@foundation.org",
  "phone": "03001234567",
  "registrationNumber": "NGO-2025-001",
  "description": "We help underprivileged communities",
  "website": "https://helpfoundation.org",
  "documents": ["doc1_url", "doc2_url"]
}
```
- **Response:** 201 Created
```json
{
  "success": true,
  "message": "NGO registered successfully. Awaiting admin approval.",
  "ngo": { ... }
}
```

### 2. Get All NGOs
- **Endpoint:** `GET /ngos/all`
- **Query Parameters:**
  - `status` (optional): Pending, Approved, Rejected
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
- **Example:** `GET /ngos/all?status=Approved&page=1&limit=10`
- **Response:** 200 OK

### 3. Get NGO by ID
- **Endpoint:** `GET /ngos/:id`
- **Response:** 200 OK

### 4. Update NGO Details
- **Endpoint:** `PUT /ngos/update/:id`
- **Request Body:** (Any fields to update except status and approval fields)
```json
{
  "description": "Updated description",
  "phone": "03009876543"
}
```
- **Response:** 200 OK

---

## Admin NGO Approval APIs

### 1. Get Pending NGOs (Admin Dashboard)
- **Endpoint:** `GET /ngos/admin/pending`
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
- **Description:** Get list of NGOs waiting for approval
- **Response:** 200 OK

### 2. Approve NGO (Admin)
- **Endpoint:** `POST /ngos/admin/approve/:id`
- **Description:** Approve a pending NGO
- **Request Body:**
```json
{
  "adminId": "ADMIN_ID_HERE"
}
```
- **Response:** 200 OK
```json
{
  "success": true,
  "message": "NGO approved successfully",
  "ngo": {
    "_id": "...",
    "status": "Approved",
    "approvalDate": "2025-12-17T...",
    "approvedBy": { ... }
  }
}
```

### 3. Reject NGO (Admin)
- **Endpoint:** `POST /ngos/admin/reject/:id`
- **Description:** Reject a pending NGO with reason
- **Request Body:**
```json
{
  "adminId": "ADMIN_ID_HERE",
  "rejectionReason": "Incomplete documentation provided"
}
```
- **Response:** 200 OK
```json
{
  "success": true,
  "message": "NGO rejected successfully",
  "ngo": {
    "_id": "...",
    "status": "Rejected",
    "rejectionReason": "Incomplete documentation provided",
    "approvalDate": "2025-12-17T..."
  }
}
```

### 4. Get NGO Statistics (Admin Dashboard)
- **Endpoint:** `GET /ngos/admin/statistics`
- **Description:** Get overview of all NGO statuses
- **Response:** 200 OK
```json
{
  "success": true,
  "statistics": {
    "total": 50,
    "approved": 35,
    "pending": 10,
    "rejected": 5
  }
}
```

---

## Health & Status

### Health Check
- **Endpoint:** `GET /health`
- **Response:** 200 OK
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-17T10:30:00.000Z"
}
```

### API Info
- **Endpoint:** `GET /`
- **Response:** 200 OK

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## Installation & Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Environment Variables (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carehaven
NODE_ENV=development
```

3. **Start Server:**
```bash
npm start
# or for development with auto-reload
npm run dev
```

4. **Test the API:**
```bash
curl http://localhost:5000/api/health
```

---

## Database Schema

### Campaign Schema
```javascript
{
  title: String,
  description: String,
  ngoId: ObjectId (ref: NGO),
  targetAmount: Number,
  collectedAmount: Number,
  category: String (enum),
  status: String (enum),
  startDate: Date,
  endDate: Date,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### NGO Schema
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  description: String,
  registrationNumber: String (unique),
  website: String,
  status: String (Pending, Approved, Rejected),
  approvedBy: ObjectId (ref: Admin),
  approvalDate: Date,
  rejectionReason: String,
  documents: Array,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Usage Examples

### Example 1: Register NGO
```bash
curl -X POST http://localhost:5000/api/ngos/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hope NGO",
    "email": "hope@ngo.org",
    "phone": "03001234567",
    "registrationNumber": "NGO-2025-001",
    "description": "Helping communities"
  }'
```

### Example 2: Create Campaign
```bash
curl -X POST http://localhost:5000/api/campaigns/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Relief",
    "description": "Help needed",
    "ngoId": "REPLACE_WITH_NGO_ID",
    "targetAmount": 100000,
    "category": "Medical",
    "startDate": "2025-01-01",
    "endDate": "2025-03-31"
  }'
```

### Example 3: Approve NGO (Admin)
```bash
curl -X POST http://localhost:5000/api/ngos/admin/approve/NGO_ID \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "REPLACE_WITH_ADMIN_ID"
  }'
```

---

**Version:** 1.0.0
**Last Updated:** December 17, 2025


