# 📝 To-Do List Backend - Node.js + Express + MongoDB

Sistem backend untuk aplikasi To-Do List dengan fitur authentication (JWT), database MongoDB, dan complete CRUD operations. Dibangun dengan Express.js dan berjalan di port 5000.

## 📋 Daftar Isi
- [Prerequisites](#prerequisites)
- [Quick Start (5 Menit)](#quick-start-5-menit)
- [Setup Detail](#setup-detail)
- [API Endpoints](#api-endpoints)
- [Postman Testing Tutorial](#postman-testing-tutorial)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

**Sebelum memulai, pastikan Anda sudah install:**

1. **Node.js** (v14 atau lebih baru)
   - Download dari: https://nodejs.org
   - Cek versi: `node --version` dan `npm --version`

2. **MongoDB** (pilih salah satu)
   - **Option A: Local MongoDB** (download & install dari https://www.mongodb.com/try/download/community)
   - **Option B: MongoDB Atlas** (cloud, lebih mudah) - https://www.mongodb.com/cloud/atlas
   
3. **Git** (optional, untuk clone repo)
   - Download dari: https://git-scm.com

4. **Postman** (untuk testing API)
   - Download dari: https://www.postman.com/downloads/

---

## Quick Start (5 Menit)

**Untuk yang ingin langsung coba tanpa banyak setup detail:**

### Step 1: Setup Database
Gunakan **MongoDB Atlas** (paling mudah tanpa install):
- Buat akun gratis di https://www.mongodb.com/cloud/atlas
- Create cluster (FREE tier)
- Copy connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### Step 2: Clone & Install

```bash
# Clone atau download folder backend
cd c:\CANTIKA\REACT\to-do-list-backend

# Install dependencies
npm install

# Install nodemon untuk auto-restart (sudah dilakukan)
npm install --save-dev nodemon
```

### Step 3: Configure .env

Buat file `.env` di folder backend dengan konten:
```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/todo-list-db
JWT_SECRET=cantika_secret_key_2024
PORT=5000
NODE_ENV=development
```

**Ganti `your_username` dan `your_password` dengan MongoDB Atlas credentials Anda!**

### Step 4: Jalankan Server

```bash
npm run dev
```

✅ Server running di: `http://localhost:5000`
✅ Siap untuk testing di Postman!

---

## Setup Detail

### 1. Configure Environment Variables

File `.env` sudah dibuat dengan konfigurasi default:
```
MONGODB_URI=mongodb://localhost:27017/todo-list-db
JWT_SECRET=cantika_secret_key_2024
PORT=5000
NODE_ENV=development
```

**Untuk Production**, ganti dengan:
- `MONGODB_URI`: Connection string MongoDB Atlas Anda
- `JWT_SECRET`: Secret key yang kuat untuk JWT

### 2. Setup MongoDB

**pilih salah satu:**

#### Option A: MongoDB Atlas (Cloud - Recommended ⭐)
Paling mudah tanpa perlu install lokal:
```
1. Buat akun gratis di https://www.mongodb.com/cloud/atlas
2. Click "Create deployment" → pilih FREE tier
3. Tunggu ~5 menit sampai cluster ter-create
4. Click "Database" → "Connect"
5. Pilih "Drivers" → Copy connection string
6. Update MONGODB_URI di .env dengan string tersebut
   Format: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname
```

#### Option B: MongoDB Local
Download dan install dari https://www.mongodb.com/try/download/community

Kemudian jalankan sesuai OS:
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Verifikasi connection:
```bash
mongosh  # atau mongo (tergantung versi)
> show dbs
```

### 3. Install Dependencies

```bash
cd c:\CANTIKA\REACT\to-do-list-backend
npm install
```

### 4. Run Backend Server

```bash
# Development mode (auto-restart dengan nodemon)
npm run dev

# Production mode
npm start
```

✅ Server akan berjalan di `http://localhost:5000`

Jika ada error "MongoDB connection failed":
- Check apakah MongoDB sudah running
- Verify `MONGODB_URI` di .env file
- Untuk MongoDB Atlas, pastikan IP address Anda di-allow di Network Access

---

## 🌐 API Endpoints

### Authentication (Public)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Buat akun baru |
| POST | `/api/auth/login` | Login & dapatkan JWT token |

### Tasks (Memerlukan JWT Token)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/tasks` | Buat task baru |
| GET | `/api/tasks` | Ambil semua task user |
| GET | `/api/tasks/:id` | Ambil detail satu task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Hapus task |

### Health Check (Public)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Cek status server |

---

## 📨 Request/Response Examples

### 1. Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "cantika",
  "email": "cantika@gmail.com",
  "password": "password123"
}

Response (200):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "cantika",
    "email": "cantika@gmail.com"
  }
}
```

### 2. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "cantika@gmail.com",
  "password": "password123"
}

Response (200):
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "cantika",
    "email": "cantika@gmail.com"
  }
}
```

### 3. Create Task
```bash
POST http://localhost:5000/api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

Request Body:
{
  "title": "Beli Skincare",
  "description": "Ke arabelle untuk beli skincare",
  "status": "not-started",
  "priority": "high",
  "dueDate": "2024-05-15"
}

Response (201):
{
  "message": "Task created successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Beli Skincare",
    "description": "Ke arabelle untuk beli skincare",
    "status": "not-started",
    "priority": "high",
    "dueDate": "2024-05-15T00:00:00.000Z",
    "user": "507f1f77bcf86cd799439011",
    "createdAt": "2024-04-21T10:30:00.000Z",
    "updatedAt": "2024-04-21T10:30:00.000Z"
  }
}
```

### 4. Get All Tasks
```bash
GET http://localhost:5000/api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200):
{
  "message": "Tasks retrieved successfully",
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Beli Skincare",
      "description": "Ke arabelle untuk beli skincare",
      "status": "not-started",
      "priority": "high",
      "dueDate": "2024-05-15T00:00:00.000Z",
      "user": "507f1f77bcf86cd799439011",
      "createdAt": "2024-04-21T10:30:00.000Z",
      "updatedAt": "2024-04-21T10:30:00.000Z"
    }
  ]
}
```

### 5. Get Single Task
```bash
GET http://localhost:5000/api/tasks/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200):
{
  "message": "Task retrieved successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Beli Skincare",
    "status": "not-started",
    "priority": "high",
    ...
  }
}
```

### 6. Update Task
```bash
PUT http://localhost:5000/api/tasks/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

Request Body (hanya field yang mau di-update):
{
  "status": "in-progress",
  "priority": "medium"
}

Response (200):
{
  "message": "Task updated successfully",
  "task": { ... updated task ... }
}
```

### 7. Delete Task
```bash
DELETE http://localhost:5000/api/tasks/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200):
{
  "message": "Task deleted successfully"
}
```

---

## 🧪 Postman Testing Tutorial

Panduan lengkap untuk testing semua API endpoints menggunakan Postman.

### Step 1: Setup Environment Variables di Postman

1. **Buka Postman** → Click tab **Environment** (kanan atas)
2. **Click "+" → Create a new environment**
   - Name: `To-Do List Local`
   - Add variable:
     - **base_url** = `http://localhost:5000`
     - **token** = (kosongkan dulu, akan otomatis di-set)
   - Click **Save**
3. **Select environment** di dropdown (kanan atas)

### Step 2: Import Collection

**Option A: Import dari File**
1. Click **File** → **Import**
2. Upload file: `todo-api.postman_collection.json`
3. Klik **Open** → Collection akan ter-import

**Option B: Manual Create Requests**
Jika belum ada collection file, Anda bisa membuat requests satu per satu sesuai panduan di bawah.

### Step 3: Test Authentication

#### Test 3a: Register User Baru

```
Method: POST
URL: {{base_url}}/api/auth/register
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "username": "cantika_test",
  "email": "cantika@test.com",
  "password": "password123"
}
```

**Click Send** → Catat `token` dari response!

**Expected Response (200):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "cantika_test",
    "email": "cantika@test.com"
  }
}
```

#### Test 3b: Login

```
Method: POST
URL: {{base_url}}/api/auth/login
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "cantika@test.com",
  "password": "password123"
}
```

**⭐ Langkah Penting:** Copy token dari response, kemudian:
1. Click **Environment** (kanan atas)
2. Set nilai `token` dengan token yang di-copy
3. Click **Save**

Sekarang semua request berikutnya otomatis menggunakan token ini!

### Step 4: Test Create Task

#### Test 4a: Create High Priority Task

```
Method: POST
URL: {{base_url}}/api/tasks
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (raw JSON):
{
  "title": "Beli Skincare",
  "description": "Ke arabelle untuk beli skincare",
  "status": "not-started",
  "priority": "high",
  "dueDate": "2024-05-15"
}
```

**Expected Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Beli Skincare",
    ...
  }
}
```

**💾 Catat `_id` untuk test berikutnya!**

#### Test 4b: Create Medium Priority Task

```
Method: POST
URL: {{base_url}}/api/tasks
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "title": "Presentasi",
  "description": "Presentasi analisis algoritma minggu depan",
  "status": "in-progress",
  "priority": "medium",
  "dueDate": "2024-04-25"
}
```

#### Test 4c: Create Low Priority Task

```
Method: POST
URL: {{base_url}}/api/tasks
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "title": "Beli Buku",
  "description": "Beli buku tan malaka di toko buku",
  "status": "not-started",
  "priority": "low",
  "dueDate": "2024-06-01"
}
```

Sekarang Anda sudah punya 3 tasks!

### Step 5: Test Get Tasks

#### Test 5a: Get All Tasks

```
Method: GET
URL: {{base_url}}/api/tasks
Headers:
  Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "message": "Tasks retrieved successfully",
  "tasks": [
    { ... task 1 ... },
    { ... task 2 ... },
    { ... task 3 ... }
  ]
}
```

#### Test 5b: Get Single Task

```
Method: GET
URL: {{base_url}}/api/tasks/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer {{token}}
```

⚠️ **Ganti ID dengan task ID yang Anda catat sebelumnya!**

### Step 6: Test Update Task

```
Method: PUT
URL: {{base_url}}/api/tasks/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (update status ke completed):
{
  "status": "completed",
  "priority": "medium"
}
```

**Expected Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "completed",
    "priority": "medium",
    ...
  }
}
```

### Step 7: Test Delete Task

```
Method: DELETE
URL: {{base_url}}/api/tasks/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

Verify dengan Get All Tasks - task sudah tidak ada!

---

## 🧪 Error Testing

Test error cases untuk validation:

### Test Error 1: Register Duplicate Email

```
Method: POST
URL: {{base_url}}/api/auth/register

Body:
{
  "username": "different_user",
  "email": "cantika@test.com",
  "password": "password123"
}
```

**Expected Response (400):**
```json
{
  "message": "Validation failed",
  "error": "User with this email already exists"
}
```

### Test Error 2: Login with Wrong Password

```
Method: POST
URL: {{base_url}}/api/auth/login

Body:
{
  "email": "cantika@test.com",
  "password": "wrongpassword"
}
```

**Expected Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

### Test Error 3: Access Task Without Token

```
Method: GET
URL: {{base_url}}/api/tasks
(JANGAN tambahkan Authorization header)
```

**Expected Response (401):**
```json
{
  "message": "No token provided"
}
```

### Test Error 4: Use Invalid Token

```
Method: GET
URL: {{base_url}}/api/tasks
Headers:
  Authorization: Bearer invalidtoken123
```

**Expected Response (401):**
```json
{
  "message": "Invalid token"
}
```

### Test Error 5: Create Task Without Title

```
Method: POST
URL: {{base_url}}/api/tasks
Headers:
  Authorization: Bearer {{token}}

Body:
{
  "description": "No title provided",
  "priority": "high"
}
```

**Expected Response (400):**
```json
{
  "message": "Validation failed",
  "error": "Title is required and must be between 3-100 characters"
}
```

---

## ✅ Checklist Testing

Setelah selesai, berikan tanda ✓ untuk setiap test yang berhasil:

**Authentication Tests:**
- [ ] Register user baru
- [ ] Login dan dapatkan token
- [ ] Set token di environment variable

**Create Task Tests:**
- [ ] Create high priority task
- [ ] Create medium priority task
- [ ] Create low priority task

**Read Tests:**
- [ ] Get all tasks
- [ ] Get single task by ID

**Update Test:**
- [ ] Update task (status/priority)

**Delete Test:**
- [ ] Delete task

**Error Tests:**
- [ ] Register duplicate email fails
- [ ] Login wrong password fails
- [ ] Access without token fails
- [ ] Invalid token fails
- [ ] Create task without title fails

**All 16 tests passed?** ✅ API backend Anda working perfectly!

---

---

## 🏗️ Database Schema

### User Model
```javascript
{
  username: String (unique, required, min: 3),
  email: String (unique, required, lowercase, regex validation),
  password: String (hashed with bcryptjs, required),
  createdAt: Date (auto)
}
```

### Task Model
```javascript
{
  title: String (required, 3-100 chars),
  description: String (max 500 chars),
  status: String (enum: 'not-started', 'in-progress', 'completed'),
  priority: String (enum: 'low', 'medium', 'high'),
  dueDate: Date (optional, harus masa depan),
  user: ObjectId (reference ke User, required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🔒 API Security Features

✅ **Password Hashing** - bcryptjs dengan salt rounds 10
✅ **JWT Authentication** - Token 7 hari expiry
✅ **User Authorization** - Tasks hanya bisa diakses user yang membuat
✅ **Input Validation** - Frontend & backend validation
✅ **Error Handling** - Proper HTTP status codes (400, 401, 403, 500)
✅ **CORS Protection** - Only allow dari frontend localhost:5173

---

## 🆘 Troubleshooting

### Problem: MongoDB Connection Failed

**Error:** `MongooseError: Cannot connect to MongoDB`

**Solution:**
```
1. Pastikan MongoDB sudah running
   - Untuk local: mongod atau brew services start mongodb-community
   - Untuk Atlas: Check network access & IP whitelist

2. Verify MONGODB_URI di .env
   - Lokal: mongodb://localhost:27017/todo-list-db
   - Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

3. Test connection dengan mongosh:
   mongosh "mongodb://localhost:27017"
```

### Problem: Port 5000 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows - Cari dan kill process di port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Atau ubah port di .env
PORT=5001
```

### Problem: CORS Error di Frontend

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
Frontend sudah ter-allow di server.js:
```javascript
cors({origin: 'http://localhost:5173'})
```
Jika frontend di port berbeda, update di server.js

### Problem: "No token provided" Error

**Saat testing di Postman**

**Solution:**
1. Login lebih dulu untuk dapatkan token
2. Copy token dari response
3. Add header ke request:
   ```
   Authorization: Bearer <token_anda>
   ```
4. Atau set di Postman environment variable

### Problem: Task Not Showing untuk User Lain

**Ini adalah intentional!**

Setiap user hanya bisa lihat tasksnya sendiri (security feature).

Jika mau test dengan user berbeda:
1. Register user baru dengan email berbeda
2. Login dengan user baru
3. Create tasks - akan ter-save untuk user baru
4. Get tasks dari user baru - hanya lihat tasksnya

---

## 💡 Development Tips

### 1. Debug Mode
```bash
DEBUG=* npm run dev
```
Akan print semua request/response details

### 2. Check MongoDB Data
```bash
# Terminal baru, jalankan mongosh
mongosh

# List semua database
> show dbs

# Gunakan database
> use todo-list-db

# Lihat collections
> show collections

# Query users
> db.users.find()

# Query tasks
> db.tasks.find()

# Cari task tertentu
> db.tasks.findOne({_id: ObjectId("507f1f77bcf86cd799439012")})
```

### 3. Reset Database
```bash
# Di mongosh
> db.users.deleteMany({})
> db.tasks.deleteMany({})

# Atau drop seluruh database
> db.dropDatabase()
```

### 4. Environment Variables
```
MONGODB_URI=<connection_string>
JWT_SECRET=<secret_key_untuk_token>
PORT=<port_number>
NODE_ENV=development|production
```

Semakin kuat JWT_SECRET, semakin aman token Anda!

### 5. Useful npm Commands
```bash
npm run dev      # Development (auto-restart)
npm start        # Production
npm test         # Run tests (jika ada)
npm install      # Install dependencies
npm update       # Update packages
```

---

## 📦 Project Structure

```
backend/
├── server.js              # Express app entry point
├── .env                   # Environment variables
├── package.json          # Dependencies & scripts
├── config/
│   └── db.js            # MongoDB connection
├── models/
│   ├── User.js          # User schema
│   └── Task.js          # Task schema
├── controllers/
│   ├── authController.js  # Register/Login logic
│   └── taskController.js  # CRUD operations
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   └── taskRoutes.js      # Task endpoints
└── middleware/
    └── auth.js          # JWT verification
```

---

## 🚀 Next Steps

### For Testing:
1. ✅ Run server: `npm run dev`
2. ✅ Follow Postman tutorial di atas
3. ✅ Complete 16 test cases
4. ✅ Take screenshots untuk assignment

### For Production:
1. Update environment variables untuk production
2. Deploy ke Heroku/Railway/Render
3. Setup MongoDB Atlas untuk production database
4. Update frontend API_BASE_URL

### For Enhancement:
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add task categories/tags
- [ ] Add recurring tasks
- [ ] Add notifications
- [ ] Add advanced filters & sorting

---

## 📞 Support

Jika ada problems:
1. Check **Troubleshooting** section di atas
2. Verify `.env` file configuration
3. Check MongoDB connection string
4. Check browser console & terminal logs
5. Restart server dengan CTRL+C, lalu `npm run dev` ulang

---

## 📝 License

Education Project - School Assignment 2024

---

**Selamat testing! Semoga API documentation ini membantu. Good luck untuk assignment Anda! 🎓**
