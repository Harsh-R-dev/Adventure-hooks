# 🧭 Adventure Hooks – Backend API

Adventure Hooks is a **production-ready RESTful API** for an adventure tourism platform.  
It provides secure authentication, role-based access control, and full CRUD operations for tours and users.

The API is deployed to production and documented with **public Postman API documentation**.

---

## 🚀 Live Deployment

### Base URL : https://adventure-hooks.onrender.com

### Example Endpoint  : GET /api/v1/tours


> ⚠️ Most endpoints are protected and require authentication via JWT.

---

## 📄 API Documentation (Postman)

📌 **Public Postman Docs:**  
👉 **https://documenter.getpostman.com/view/49242430/2sBXVoA8T9**

The documentation includes:
- Authentication flow (login / signup)
- Protected endpoints using JWT
- Request & response examples
- Error responses (401, 404, etc.)

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **ORM:** Mongoose  
- **Authentication:** JWT (JSON Web Tokens)  
- **Deployment:** Render  
- **API Documentation:** Postman  

---

## ✨ Features

- 🔐 JWT-based authentication & authorization  
- 👥 Role-based access control (user, admin)  
- 🧭 Tour management (CRUD operations)  
- 📊 Advanced querying (filtering, sorting, pagination)  
- 🧪 Centralized error handling  
- 🌍 Production deployment with environment-based configuration  

---

## 📂 API Structure

### 🔑 Authentication
- `POST /api/v1/users/signup`
- `POST /api/v1/users/login`

### 🧭 Tours
- `GET /api/v1/tours` *(protected)*
- `GET /api/v1/tours/:id` *(protected)*
- `POST /api/v1/tours` *(admin only)*
- `PATCH /api/v1/tours/:id` *(admin only)*
- `DELETE /api/v1/tours/:id` *(admin only)*

### 👤 Users
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

> Full endpoint details are available in the Postman documentation.

---

## 🔐 Authentication

This API uses **Bearer Token authentication**.

Example:  
Authorization: Bearer <JWT_TOKEN>


JWT tokens are obtained via the login endpoint.

---

## ⚙️ Environment Variables

The following environment variables are required to run the application in production:

NODE_ENV=production  
PORT=3000  
DATABASE=<MongoDB connection string>  
JWT_SECRET=<your-secret>  
JWT_EXPIRES_IN=90d  
JWT_COOKIE_EXPIRES_IN=90  

> ⚠️ Sensitive values should **never** be committed to version control.

---

## 🧪 Running Locally

```bash
git clone https://github.com/fontawesome01/Adventure-hooks.git
cd Adventure-hooks
npm install
npm run dev

```
Create a config.env file locally for development.

## 📌 Project Status

- ✔ Backend complete  
- ✔ Production deployed  
- ✔ Public API documentation published  
- ✔ Ready for frontend integration  

---

## 👨‍💻 Author

**Harsh Rajput**  
Backend Developer  

- GitHub: https://github.com/fontawesome01



