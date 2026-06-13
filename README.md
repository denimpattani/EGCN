<br />
<div align="center">
  <img src="client/public/EGC-Logo.png" alt="Logo" width="300" />
  <h1 align="center">EGC Network (EGCN) Platform</h1>
  <p align="center">
    <strong>A Premium B2B SaaS Platform Connecting Businesses with Industry Experts</strong>
    <br />
    <br />
    <a href="#sparkles-features">Features</a> ·
    <a href="#hammer_and_wrench-tech-stack">Tech Stack</a> ·
    <a href="#rocket-quick-start">Quick Start</a> ·
    <a href="#whale-docker-deployment">Docker Deployment</a>
  </p>
</div>

---

## 📖 Overview

EGC Network (EGCN) is an enterprise-grade SaaS application designed to seamlessly bridge the gap between business owners and seasoned industry experts. The platform offers a rich, real-time ecosystem providing expert advisory services, dynamic daily/monthly business goal tracking, automated analytics generation, and integrated video & chat communication.

The application leverages a modern microservice-inspired monolithic architecture built with the **MERN** stack, incorporating advanced caching, bi-directional socket streams, and WebRTC peer-to-peer connections.

---

## :sparkles: Features

### 🏢 **For Clients**
- **Dynamic Dashboard & Insights:** Real-time data visualization of daily metrics, monthly goals, and annual progress.
- **Expert Matchmaking:** Receive personalized business advice through matched industry experts.
- **Real-Time Communication:** Live WebRTC video conferencing and WebSocket-powered instant messaging.
- **Automated Billing:** Integrated Razorpay payment gateways for automated, tiered subscription management.
- **Premium Notifications:** Beautifully designed, responsive HTML emails triggered on key actions (OTP, Password Reset, Billing, Meetings).

### 👨‍💼 **For Experts**
- **Client Management:** Manage multiple assigned businesses, view their health metrics, and provide direct feedback.
- **Integrated Calendar:** Real-time scheduling for one-on-one consulting calls.

### 🛡️ **For Administrators**
- **Platform Control Center:** Granular management of Users, Experts, and dynamic Subscription Plans.
- **Metrics Dashboard:** Monitor live MRR (Monthly Recurring Revenue), active subscriptions, and platform growth.

---

## :hammer_and_wrench: Tech Stack

### Frontend (Client)
- **Framework:** React 18 (Bootstrapped with Vite)
- **Styling:** TailwindCSS 
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Real-Time:** Socket.io-client, PeerJS (WebRTC)
- **Data Visualization:** Recharts, Chart.js

### Backend (Server)
- **Runtime:** Node.js v20+
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ORM)
- **Caching & Auth:** Redis (JWT Blacklisting & OTP temporary storage)
- **Authentication:** JWT (HttpOnly Cookies, Access/Refresh Token rotation)
- **Integrations:** Razorpay (Payments), Cloudinary (Asset Storage), Nodemailer (Emails), PDFKit (Invoice Generation)
- **Background Jobs:** Node-Cron

### DevOps & Deployment
- **Containerization:** Docker & Docker Compose
- **Proxy/Web Server:** NGINX

---

## :rocket: Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Redis](https://redis.io/) (Running locally on port `6379`)

### 1. Clone the Repository
```bash
git clone https://github.com/denimpattani/EGCN.git
cd EGCN
```

### 2. Environment Setup
You will need `.env` files in both the `client` and `server` directories.

**`server/.env`**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/egcn
REDIS_URL=redis://127.0.0.1:6379

# Authentication
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret

# SMTP (Emails)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="EGCN Support" <support@egcn.in>
FRONTEND_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Install & Run
Open two terminal windows:

**Terminal 1 (Backend)**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd client
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the application!

---

## :whale: Docker Deployment (Production)

The repository comes fully configured for containerized deployment using Docker Compose. The configuration handles spinning up MongoDB, Redis, the Node Backend, and the NGINX-served React Frontend.

### Steps to Deploy
1. Ensure Docker and Docker Compose are installed on your target server.
2. Clone the repository to the server.
3. Populate the necessary `.env` values directly inside `docker-compose.yml` (or pass a `.env` file).
4. Run the build command from the root directory:

```bash
docker-compose up -d --build
```
Your application is now running securely behind the NGINX reverse proxy on port `80`!

---

## 🔒 Security Posture
- **Authentication:** Strict stateless Access Tokens alongside HttpOnly, SameSite cookies for Refresh Tokens. 
- **Blacklisting:** Highly secure logout and refresh revocation utilizing Redis TTL stores.
- **Rate Limiting:** Global and targeted rate limiting on API endpoints (via `express-rate-limit`).
- **Cryptographic Signatures:** Bulletproof Webhook and Payment verification via Razorpay HMAC-SHA256 signatures.

---
<div align="center">
  <i>Developed and designed for EGC Network.</i>
</div>
