# CareHaven
# 🌍 CareHaven – Online Donation Platform

> A modern charity donation platform that connects donors with NGOs and charitable organizations through a transparent, organized, and user-friendly experience.

---

## 📖 Overview

CareHaven is a full-stack web application designed to simplify the donation process and improve transparency between donors and charitable organizations.

The platform enables donors to discover and support charitable campaigns, while NGOs can create, manage, and track fundraising campaigns through dedicated dashboards.

The system promotes trust and accountability by allowing organizations to publish reports and updates showing how donations are being utilized and the impact they create.

---

## ✨ Key Features

### 👤 Authentication & User Management

* User Registration
* User Login & Logout
* Role-Based Access Control
* Secure Authentication System

### ❤️ Donor Features

* Browse available campaigns
* View campaign details
* Track campaign progress
* Donate to campaigns
* Access personal dashboard

### 🏢 NGO Features

* NGO Dashboard
* Create new fundraising campaigns
* Edit campaign information
* Upload campaign images
* Set funding goals
* Monitor donations
* Upload impact reports and updates

### 📊 Campaign Management

* Campaign listing page
* Search functionality
* Campaign filtering
* Detailed campaign pages
* Funding progress tracking
* Goal vs. collected amount visualization

### 📱 Responsive Design

* Mobile-friendly interface
* Tablet support
* Desktop optimized layout
* Modern and intuitive user experience

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Additional Tools

* Git & GitHub
* REST APIs
* Authentication Middleware

---

## 👥 User Roles

### Donor

A donor can:

* Register and log in
* Browse campaigns
* View campaign details
* Donate to campaigns
* Track donation activities

### NGO / Charity Organization

An NGO can:

* Create campaigns
* Manage campaigns
* Upload campaign media
* Monitor donations
* Publish reports and updates

### Admin (If Enabled)

An administrator can:

* Manage users
* Monitor campaigns
* Review platform activities
* Maintain system integrity

---

## 🔄 System Workflow

1. Users create an account or log in.
2. Donors browse available campaigns.
3. NGOs create and manage fundraising campaigns.
4. Donors view campaign details and contribute.
5. NGOs track donations and funding progress.
6. NGOs upload reports demonstrating donation impact.
7. Donors remain informed through campaign updates and reports.

---

## 📁 Project Structure

```text
CareHaven/
│
├── WebProject/
│   └── donation-system/
│       ├── HTML Pages
│       ├── CSS Files
│       ├── JavaScript Files
│       └── Assets
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
├── scripts/
│
├── package.json
├── README.md
├── DEPLOYMENT_GUIDE.md
└── FINAL_PROJECT_HEALTH_REPORT.md
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/nour-hossam7/CareHaven.git
```

### Navigate to Project

```bash
cd CareHaven
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the backend directory and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Run the Project

```bash
npm start
```

or

```bash
npm run dev
```

---

## 📄 Available Pages

* Home Page
* Login Page
* Registration Page
* Campaign Listing Page
* Campaign Details Page
* Donation Page
* Donor Dashboard
* NGO Dashboard
* Campaign Creation Page
* Report Upload Page
* Admin Dashboard (if enabled)

---

## 🔒 Security Features

* Authentication System
* Role-Based Authorization
* Input Validation
* Protected Routes
* Secure Database Operations
* Error Handling Mechanisms

---

## 📈 Future Enhancements

* Online Payment Gateway Integration
* Email Notifications
* Real-Time Donation Tracking
* Campaign Approval Workflow
* Analytics Dashboard
* Multi-Language Support
* AI-Based Donation Recommendations

## 🤝 Contribution

Contributions, suggestions, and improvements are welcome.

---

## 👩‍💻 Author

**Nour Hossam**

Faculty of Computers & Information Systems
Egyptian Chinese University (ECU)

GitHub:
https://github.com/nour-hossam7
