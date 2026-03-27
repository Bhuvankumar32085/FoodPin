# 🍔 FoodPin – Full Stack Food Delivery Platform

FoodPin is a full-stack food delivery application inspired by real-world platforms like Zomato and Swiggy.  
It is built using a microservices architecture with real-time features including live tracking between users and delivery partners, scalable backend services, and production-level deployment.

---

## 🚀 Live Demo

Frontend:  
https://food-pin.vercel.app  

---

## 📌 Overview

This project focuses on building a scalable and modular food delivery system.  
Each core functionality is separated into independent services, making the system easier to maintain and scale.

---

## 👥 User Roles

The application supports multiple user roles:

- **Customer** – Browse food, place orders, and track deliveries  
- **Restaurant (Seller)** – Manage menu and handle incoming orders  
- **Delivery Partner (Rider)** – Accept and deliver orders  
- **Admin** – Verify and manage system operations  

---

## ⚙️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS / Custom CSS  
- Deployed on Vercel  

### Backend
- Node.js  
- Express.js  
- MongoDB  

### Real-Time & Communication
- Socket.IO (for live updates)  
- RabbitMQ (for service-to-service communication)  

### DevOps & Infrastructure
- Docker (containerization)  
- Redis (caching & performance)  
- AWS (RabbitMQ hosting)  
- Render (backend deployment)  

### Payments
- Razorpay (for Indian users)  
- Stripe (for global users)  

---

## 🏗️ Microservices

The backend is divided into the following services:

```js
 authService = "https://foodpin-auth-latest.onrender.com"; 
 restaurantService = "https://foodpin-restaurant7.onrender.com";
 utilsService = "https://foodpin-utils.onrender.com";
 realtimeService = "https://foodpin-realtime-latest.onrender.com";
 riderService = "https://foodpin-rider2.onrender.com";
 adminService = "https://foodpin-admin-latest.onrender.com";
```

---

## 🔥 Features

- User authentication with role-based access  
- Food ordering and cart system  
- Real-time order status updates  
- Live delivery tracking  
- Rider navigation support  
- Notification system (order updates)  
- Secure payment integration (Razorpay & Stripe)  

---


## 📚 Learning Outcomes

While building this project, I worked on:

- Designing a microservices-based system  
- Implementing real-time features using Socket.IO  
- Using RabbitMQ for communication between services  
- Integrating payment gateways  
- Deploying scalable applications using Docker and cloud platforms  

---

## 📎 Note

This project is a practical implementation of how modern food delivery platforms work internally, including real-time tracking and distributed backend systems.
