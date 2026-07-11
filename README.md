# 🍱 FoodBridge — AI Food Donation System

A complete MERN stack application that leverages AI to predict food quality and smartly match donations with NGOs.

## 🚀 Features

- **Role-Based Access Control**: Separate dashboards and functionalities for Donors, NGOs, Volunteers, and Admins.
- **AI Quality Predictor**: Heuristic-based AI engine that evaluates food quality/safety based on expiry date, storage temperature, packaging, and food type.
- **AI Recommendation Engine**: Automatically matches NGOs with the most relevant and high-quality available donations in their city.
- **End-to-End Tracking**: Real-time status updates from "Available" -> "Claimed" -> "Picked Up" -> "Delivered".
- **Glassmorphic UI**: Premium, modern, responsive frontend built with React and Vanilla CSS.
- **Analytics Dashboard**: Admins can view platform-wide metrics, monthly trends, and food-type distributions.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, React Router DOM, Context API (for state)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **AI Engine**: Custom multi-factor rule-based AI heuristic engine (No external API costs)

## 📦 Project Structure

```text
Ai-food-donation-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Modals, Toasts, Sidebar)
│   │   ├── context/        # Auth & Toast State
│   │   ├── layouts/        # Dashboard wrappers
│   │   ├── pages/          # Role-based views (Admin, NGO, Donor, etc.)
│   │   ├── services/       # Axios API integration
│   │   ├── utils/          # Formatters & Constants
│   │   └── App.jsx         # Main router
├── server/                 # Node/Express Backend
│   ├── config/             # DB & Env setup
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth, Error, & Role guards
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API Endpoints
│   ├── services/           # AI & Notification logic
│   ├── utils/              # Token generation
│   └── server.js           # Express entry point
```

## ⚙️ How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port `27017`)

### 2. Setup Backend
```bash
cd server
npm install
npm run dev
```
*The server will start on http://localhost:5000*

### 3. Setup Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The client will start on http://localhost:5173*

## 👥 Default Roles

When you register a new account, you can select whether you are a **Donor**, **NGO**, or **Volunteer**.

To create an **Admin** account:
1. Register a normal user.
2. Manually change the `role` field to `admin` in your MongoDB database for that user document.
3. Log in to access the Admin Dashboard.
