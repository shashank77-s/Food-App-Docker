<<<<<<< HEAD
# 🍕 Food Delivery App — MERN Stack

A full-stack food ordering app built with MongoDB, Express, React, and Node.js.

---

## ⚙️ ENV Variables — REQUIRED BEFORE RUNNING

### Backend — create `backend/.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodapp
JWT_SECRET=foodappsupersecretkey123
```

### Frontend — create `frontend/.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run

### 1. Install MongoDB locally
Download from: https://www.mongodb.com/try/download/community

### 2. Backend setup
```bash
cd backend
npm install
# Create .env file with variables above
npm run dev
```
Backend runs on: http://localhost:5000

### 3. Frontend setup
```bash
cd frontend
npm install
# Create .env file with variables above
npm start
```
Frontend runs on: http://localhost:3000

---

## 📦 Features
- ✅ User signup & login (JWT auth)
- ✅ Browse food menu with category filter
- ✅ Add / remove items from cart
- ✅ Place orders with delivery address
- ✅ View order history & cancel orders
- ✅ Admin: add/edit/delete food items, update order status

## 🔑 Make yourself Admin
After signing up, open MongoDB Compass and run:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
=======
# Food-Docker
>>>>>>> 61dd07966036562ec0d368fbae98f654854404bc
