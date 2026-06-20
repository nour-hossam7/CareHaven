# CareHaven Backend

A comprehensive RESTful API backend for the CareHaven donation platform.

## Features

✓ **Campaign Management APIs**
  - Create campaigns
  - Get all campaigns with filters and pagination
  - Get campaign by ID
  - Get campaigns by NGO ID
  - Update campaign details
  - Delete campaigns

✓ **NGO Management APIs**
  - NGO registration
  - Get all NGOs with filters
  - Get NGO by ID
  - Update NGO details

✓ **Admin NGO Approval System**
  - View pending NGOs for approval
  - Approve NGOs
  - Reject NGOs with reason
  - View NGO statistics
  - Track approval history

## Project Structure

```
backend/
├── models/
│   ├── Campaign.js      # Campaign data schema
│   ├── NGO.js          # NGO data schema
│   └── Admin.js        # Admin data schema
├── controllers/
│   ├── campaignController.js  # Campaign business logic
│   └── ngoController.js       # NGO management logic
├── routes/
│   ├── campaignRoutes.js      # Campaign API endpoints
│   └── ngoRoutes.js           # NGO API endpoints
├── server.js           # Main Express server
├── package.json        # Dependencies
├── .env               # Environment variables
└── API_DOCUMENTATION.md # Complete API reference
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Clone and Navigate:**
```bash
cd backend
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carehaven
NODE_ENV=development
```

4. **Start MongoDB:**
```bash
# If using local MongoDB
mongod
```

## Running the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints Summary

### Campaigns
- `POST /api/campaigns/create` - Create campaign
- `GET /api/campaigns/all` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `GET /api/campaigns/ngo/:ngoId` - Get campaigns by NGO
- `PUT /api/campaigns/update/:id` - Update campaign
- `DELETE /api/campaigns/delete/:id` - Delete campaign

### NGOs
- `POST /api/ngos/register` - Register NGO
- `GET /api/ngos/all` - Get all NGOs
- `GET /api/ngos/:id` - Get NGO by ID
- `PUT /api/ngos/update/:id` - Update NGO
- `GET /api/ngos/admin/pending` - Get pending NGOs (Admin)
- `POST /api/ngos/admin/approve/:id` - Approve NGO (Admin)
- `POST /api/ngos/admin/reject/:id` - Reject NGO (Admin)
- `GET /api/ngos/admin/statistics` - Get NGO statistics (Admin)

### Health Check
- `GET /api/health` - Server health check
- `GET /api` - API info

## Quick Test

```bash
# Health check
curl http://localhost:5000/api/health

# Get all campaigns
curl http://localhost:5000/api/campaigns/all

# Get all NGOs
curl http://localhost:5000/api/ngos/all
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/carehaven |
| `NODE_ENV` | Environment (development/production) | development |

## Database Collections

### campaigns
- title, description, ngoId, targetAmount, collectedAmount
- category, status, startDate, endDate
- image, createdAt, updatedAt

### ngos
- name, email, phone, registrationNumber
- description, website, status
- approvedBy, approvalDate, rejectionReason
- documents, createdAt, updatedAt

### admins
- name, email, password, role
- createdAt

## Error Handling

All errors return a consistent JSON response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Deployment

1. **Set Environment Variables** on your hosting platform
2. **Ensure MongoDB is accessible** from your server
3. **Run:** `npm install && npm start`
4. **Monitor logs** for any issues

## Contributing

1. Create a new branch for features
2. Test thoroughly before committing
3. Update documentation as needed

## Support

For issues or questions about the API, refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Version:** 1.0.0  
**Last Updated:** December 17, 2025
