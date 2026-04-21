# To-Do List Application 

Aplikasi To-Do List lengkap dengan frontend React dan backend Node.js/Express. Fitur termasuk authentication, priority levels, due dates, edit/delete tasks, dan form validation.

## Daftar Isi
- [Quick Start](#quick-start-5-menit)
- [Prerequisites](#prerequisites)
- [Folder Structure](#folder-structure)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Menjalankan Sistem](#menjalankan-sistem)
- [Testing dengan Postman](#testing-dengan-postman)
- [Features](#-features)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (5 Menit)

Untuk menjalankan aplikasi lengkap:

### Terminal 1 - Backend (Port 5000)
```bash
cd to-do-list-backend
npm install
npm run dev
```

### Terminal 2 - Frontend (Port 5173)
```bash
cd to-do-list
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

---

## Prerequisites

Pastikan sudah install:

1. **Node.js** (v14+) → https://nodejs.org
2. **MongoDB** (pilih salah satu):
   - Local: https://www.mongodb.com/try/download/community
   - Cloud: https://www.mongodb.com/cloud/atlas (recommended)
3. **Git** (optional) → https://git-scm.com
4. **Postman** (untuk testing) → https://www.postman.com/downloads/

Verify installation:
```bash
node --version
npm --version
```

---

## Folder Structure

```
to-do-list/                          # Frontend (React)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation bar with logout
│   │   ├── ToDoInput.jsx           # Form untuk create task
│   │   └── ToDoItem.jsx            # Task display & edit
│   ├── pages/
│   │   ├── Dashboard.jsx           # Main task list
│   │   ├── Login.jsx               # Login page
│   │   └── Register.jsx            # Register page
│   ├── context/
│   │   └── AuthContext.jsx         # Auth state management
│   ├── services/
│   │   └── api.js                  # API client
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md

to-do-list-backend/                 # Backend (Express + MongoDB)
├── server.js                       # Express app
├── config/
│   └── db.js                       # MongoDB connection
├── models/
│   ├── User.js                     # User schema
│   └── Task.js                     # Task schema
├── controllers/
│   ├── authController.js           # Auth logic
│   └── taskController.js           # CRUD logic
├── routes/
│   ├── authRoutes.js               # Auth endpoints
│   └── taskRoutes.js               # Task endpoints
├── middleware/
│   └── auth.js                     # JWT verification
├── .env                            # Environment variables
├── package.json
└── README.md
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd to-do-list
npm install
```

### 2. Check Environment
Frontend akan connect ke backend di `http://localhost:5000` (default di `services/api.js`)

Jika backend di URL berbeda, update di:
```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:5000';
```

### 3. Jalankan Frontend
```bash
npm run dev
```

Buka browser: `http://localhost:5173`

---

## Backend Setup

**PENTING:** Setup backend LEBIH DULU sebelum frontend!

### 1. Install Dependencies
```bash
cd to-do-list-backend
npm install
```

### 2. Setup Database

**Option A: MongoDB Atlas (Cloud) - RECOMMENDED**
```
1. Buat akun gratis di https://www.mongodb.com/cloud/atlas
2. Create deployment (FREE tier)
3. Copy connection string
4. Update .env:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-list-db
```

**Option B: MongoDB Local**
```bash
# Install dari https://www.mongodb.com/try/download/community
# Jalankan:
mongod
```

### 3. Configure .env
Buat file `.env` di folder backend:
```
MONGODB_URI=mongodb://localhost:27017/todo-list-db
JWT_SECRET=cantika_secret_key_2024
PORT=5000
NODE_ENV=development
```

### 4. Jalankan Backend
```bash
npm run dev
```

Server running: `http://localhost:5000`

---

## Menjalankan Sistem

### Setup Awal (First Time):

**Step 1: Terminal 1 - Backend**
```bash
cd to-do-list-backend
npm install
npm run dev
```
Tunggu sampai: `Server running on port 5000`

**Step 2: Terminal 2 - Frontend**
```bash
cd to-do-list
npm install
npm run dev
```
Tunggu sampai compile selesai, buka browser ke `http://localhost:5173`

### Menjalankan Setelah Setup (Subsequent Times):

**Terminal 1:**
```bash
cd to-do-list-backend && npm run dev
```

**Terminal 2:**
```bash
cd to-do-list && npm run dev
```

---

## Testing dengan Postman

### Step 1: Setup Environment
1. Buka Postman
2. Create environment: `To-Do List Local`
3. Add variables:
   - `base_url` = `http://localhost:5000`
   - `token` = (kosongkan, akan auto di-set)

### Step 2: Import Collection
1. File → Import
2. Upload: `to-do-list-backend/todo-api.postman_collection.json`
3. Selesai!

### Step 3: Testing Flow

**Urutan testing yang HARUS diikuti:**

1. **Register User** → Dapatkan token
2. **Login** → Copy token ke environment
3. **Create Task** (High/Medium/Low priority)
4. **Get All Tasks** → Verify semuanya ada
5. **Get Single Task** → Ambil task ID dari response
6. **Update Task** → Change status/priority
7. **Delete Task** → Hapus task

**Testing Error Cases:**
- Register duplicate email (400)
- Login wrong password (401)
- Access without token (401)
- Invalid token (401)
- Create task without title (400)

**Total 16 test cases yang harus berhasil!**

Untuk tutorial detail, lihat: [Backend Testing Guide](../to-do-list-backend/README.md#-postman-testing-tutorial)

---

## Features

### Authentication & Authorization
- Register user baru dengan validasi
- Login dengan JWT token (7 hari expiry)
- Logout dengan session clear
- User-specific tasks (hanya bisa lihat task sendiri)
- Password hashing dengan bcryptjs

### Task Management
- **Create Task** - Form dengan validation
- **Read Tasks** - List dengan statistics (completed %, in-progress %, not-started %)
- **Edit Task** - Ubah title, description, status, priority, dueDate
- **Delete Task** - Dengan confirmation dialog

### Task Features
- **Priority Levels**: Low (Blue), Medium (Orange), High (Red)
- **Due Dates**: Date picker dengan validation (hanya future dates)
- **Status Tracking**: not-started, in-progress, completed
- **Priority Badges**: Color-coded display pada dashboard

### Form Validation
- **Title**: 3-100 characters dengan counter
- **Description**: Max 500 characters dengan counter
- **Priority**: Enum validation (low/medium/high)
- **Due Date**: Must be in future
- **Real-time errors**: Validation feedback langsung

### User Interface
- Responsive design dengan pink theme
- Navbar dengan logout button
- Dashboard dengan task statistics
- Loading states untuk async operations
- Error messages yang informatif
- Edit/View mode toggle untuk tasks

### Backend Features
- RESTful API dengan proper HTTP status codes
- CORS protection untuk frontend
- Input validation di frontend & backend
- Error handling yang comprehensive
- Middleware untuk JWT verification

---

## API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Register user | ❌ |
| POST | `/api/auth/login` | Login & get token | ❌ |
| POST | `/api/tasks` | Create task | ✅ |
| GET | `/api/tasks` | Get all tasks | ✅ |
| GET | `/api/tasks/:id` | Get single task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task | ✅ |

Untuk request/response examples, lihat: [Backend API Documentation](../to-do-list-backend/README.md#-requesteresponse-examples)

---

## Troubleshooting

### Frontend tidak bisa connect ke backend
**Error:** `Failed to fetch from http://localhost:5000`

**Solution:**
1. Backend running di terminal 1?
2. Check port 5000 available: `lsof -i :5000`
3. Update API_BASE_URL di `src/services/api.js` jika perlu
4. Check browser console untuk error details

### MongoDB Connection Failed
**Error:** `MongooseError: Cannot connect to MongoDB`

Lihat: [Backend Troubleshooting](../to-do-list-backend/README.md#-troubleshooting)

### Port Already in Use
```bash
# Port 5000 untuk backend
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Port 5173 untuk frontend - biasanya otomatis pakai port lain
```

### CORS Error
Sudah di-handle di backend untuk `http://localhost:5173`
Jika masih error, check `server.js` CORS configuration

### Token Expired
Login ulang untuk dapatkan token baru (JWT expiry 7 hari)

### Cannot Read Tasks Dari User Lain
**Ini intentional!** Setiap user hanya bisa lihat/edit/delete tasksnya sendiri.

---

## Development Tips

### Debug Mode
```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev -- --debug
```

### Check MongoDB Data
```bash
mongosh
> use todo-list-db
> db.tasks.find()
> db.users.find()
```

### Reset Database
```bash
mongosh
> use todo-list-db
> db.users.deleteMany({})
> db.tasks.deleteMany({})
```

### Useful npm Commands
```bash
# Both frontend & backend
npm install                # Install dependencies
npm run dev               # Development (auto-restart)
npm start                 # Production
npm update                # Update packages
```

---

## For Production

### Frontend Build
```bash
cd to-do-list
npm run build
# Output di folder dist/
```

### Backend Deployment
```bash
# Perbarui .env untuk production
MONGODB_URI=<production_db_uri>
JWT_SECRET=<strong_secret_key>
NODE_ENV=production
PORT=<your_port>

# Deploy ke Heroku/Railway/Render
npm start
```

### Environment Variables
```
Frontend (.env):
- VITE_API_BASE_URL=<production_backend_url>

Backend (.env):
- MONGODB_URI=<production_db_uri>
- JWT_SECRET=<strong_key>
- NODE_ENV=production
- PORT=<your_port>
```

---

## School Assignment Info

**Status**: Fully functional
**Features**: 4 main features implemented (Edit, Delete, Form Validation, Due Dates, Priority)
**Backend**: Complete with JWT auth & MongoDB
**Frontend**: Fully integrated with API
**Testing**: 16 test cases in Postman collection
**Documentation**: Comprehensive README & guides

**Untuk assignment submission, siapkan:**
- Screenshots dari Postman testing (16 test cases)
- Screenshots dari aplikasi yang running
- Database data screenshot (mongosh atau MongoDB Compass)
- Frontend & backend source code

---

## Support & Resources

### Documentation
- [Backend API Documentation](../to-do-list-backend/README.md)
- [Postman Testing Guide](../to-do-list-backend/README.md#-postman-testing-tutorial)

### External Links
- React Docs: https://react.dev
- Vite Guide: https://vite.dev
- Express.js: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Mongoose: https://mongoosejs.com

---

**Happy coding! Semoga aplikasi ini membantu untuk assignment Anda. Good luck!**
