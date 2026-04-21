# Panduan Test API di Postman - To-Do List Backend

## 🎯 Persiapan

### 1. Download Postman
- Download di https://www.postman.com/downloads/
- Install dan buka aplikasi

### 2. Start Backend Server

**Terminal:**
```bash
cd c:\CANTIKA\REACT\to-do-list-backend
npm run dev
```

Pastikan server sudah running di `http://localhost:5000/api/health`

### 3. Cek Health Check (Optional)

Di Postman:
- Method: **GET**
- URL: `http://localhost:5000/api/health`
- Click **Send**

Response:
```json
{
    "message": "Server is running"
}
```

---

## 📋 Test Flow (Langkah-langkah)

### Step 1: Register User Baru

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "cantika_test",
  "email": "cantika@test.com",
  "password": "password123"
}
```

**Send** → Copy **token** dari response ✅

Response contoh:
```json
{
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "66257a1b8f1a2b3c4d5e6f7g",
        "username": "cantika_test",
        "email": "cantika@test.com"
    }
}
```

---

### Step 2: Login (Dapatkan Token)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "cantika@test.com",
  "password": "password123"
}
```

**Send** → Copy **token** untuk request berikutnya ✅

---

### Step 3: Create Task

**Method:** `POST`  
**URL:** `http://localhost:5000/api/tasks`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <PASTE_TOKEN_HERE>
```

**Body:**
```json
{
  "title": "Beli Skincare",
  "description": "Ke arabelle untuk beli skincare",
  "status": "not-started",
  "priority": "high",
  "dueDate": "2024-05-15"
}
```

**Send** ✅

Response:
```json
{
    "message": "Task created successfully",
    "task": {
        "_id": "66257a1b8f1a2b3c4d5e6f7h",
        "title": "Beli Skincare",
        "description": "Ke arabelle untuk beli skincare",
        "status": "not-started",
        "priority": "high",
        "dueDate": "2024-05-15T00:00:00.000Z",
        "user": "66257a1b8f1a2b3c4d5e6f7g",
        "createdAt": "2024-04-21T10:30:00.123Z",
        "updatedAt": "2024-04-21T10:30:00.123Z"
    }
}
```

---

### Step 4: Get All Tasks

**Method:** `GET`  
**URL:** `http://localhost:5000/api/tasks`

**Headers:**
```
Authorization: Bearer <PASTE_TOKEN_HERE>
```

**No body needed!**

**Send** ✅

Response:
```json
{
    "tasks": [
        {
            "_id": "66257a1b8f1a2b3c4d5e6f7h",
            "title": "Beli Skincare",
            "description": "Ke arabelle untuk beli skincare",
            "status": "not-started",
            "priority": "high",
            "dueDate": "2024-05-15T00:00:00.000Z",
            "user": "66257a1b8f1a2b3c4d5e6f7g",
            "createdAt": "2024-04-21T10:30:00.123Z",
            "updatedAt": "2024-04-21T10:30:00.123Z"
        }
    ]
}
```

---

### Step 5: Get Single Task

**Method:** `GET`  
**URL:** `http://localhost:5000/api/tasks/66257a1b8f1a2b3c4d5e6f7h`

**Headers:**
```
Authorization: Bearer <PASTE_TOKEN_HERE>
```

**Send** ✅

---

### Step 6: Update Task

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/tasks/66257a1b8f1a2b3c4d5e6f7h`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <PASTE_TOKEN_HERE>
```

**Body:**
```json
{
  "title": "Beli Skincare di Arabelle",
  "status": "in-progress",
  "priority": "medium"
}
```

**Send** ✅

---

### Step 7: Delete Task

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/tasks/66257a1b8f1a2b3c4d5e6f7h`

**Headers:**
```
Authorization: Bearer <PASTE_TOKEN_HERE>
```

**No body!**

**Send** ✅

Response:
```json
{
    "message": "Task deleted successfully"
}
```

---

## 🛠️ Tips Postman

### Menggunakan Environment Variables

Untuk tidak perlu copy-paste token setiap kali:

1. **Buat Environment:**
   - Click ⚙️ (Settings) → **Environments** → **Create**
   - Nama: `To-Do List Local`

2. **Tambah Variables:**
   ```
   Variable    | Initial Value           | Current Value
   -----------|-------------------------|------------------
   base_url   | http://localhost:5000   | http://localhost:5000
   token      | (kosong)                | (otomatis)
   ```

3. **Save & Select Environment:**
   - Click dropdown di kanan atas → Select `To-Do List Local`

4. **Update URL di Postman:**
   ```
   {{base_url}}/api/auth/register
   {{base_url}}/api/tasks
   ```

5. **Auto-save Token:**
   - Di tab terakhir **Tests** dari request Login, tambah:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   ```
   - Setelah login, token otomatis tersimpan!

6. **Gunakan Token:**
   ```
   Authorization: Bearer {{token}}
   ```

---

## 📊 Contoh Test Cases untuk Tugas

Siapkan screenshots untuk laporan:

### Test Case 1: Register User
```
Input:
- username: "cantika_test"
- email: "cantika@test.com"
- password: "password123"

Expected Output:
- Status: 201 Created
- Response berisi: token, user object
```

### Test Case 2: Login
```
Input:
- email: "cantika@test.com"
- password: "password123"

Expected Output:
- Status: 200 OK
- Response berisi: token, user object
```

### Test Case 3: Create Task
```
Input:
- title: "Beli Skincare"
- priority: "high"
- dueDate: "2024-05-15"

Expected Output:
- Status: 201 Created
- Task tersimpan di database
```

### Test Case 4: Get All Tasks
```
Expected Output:
- Status: 200 OK
- Array of tasks untuk user login
```

### Test Case 5: Update Task
```
Input:
- status: "completed"
- priority: "low"

Expected Output:
- Status: 200 OK
- Task updated successfully
```

### Test Case 6: Delete Task
```
Expected Output:
- Status: 200 OK
- "Task deleted successfully"
```

---

## ⚠️ Error Cases

Untuk lengkap, test juga error cases:

### Error 1: Register dengan Email Sudah Ada
```
POST /api/auth/register
{
  "username": "user2",
  "email": "cantika@test.com",  // sudah terdaftar
  "password": "pass123"
}

Expected:
Status: 400 Bad Request
{
    "message": "User already exists"
}
```

### Error 2: Login Invalid Email/Password
```
POST /api/auth/login
{
  "email": "wrong@email.com",
  "password": "wrongpass"
}

Expected:
Status: 401 Unauthorized
{
    "message": "Invalid email or password"
}
```

### Error 3: Akses Task Tanpa Token
```
GET /api/tasks
(TANPA Authorization header)

Expected:
Status: 401 Unauthorized
{
    "message": "No token provided. Authorization denied."
}
```

### Error 4: Token Expired/Invalid
```
GET /api/tasks
Authorization: Bearer invalidtoken123

Expected:
Status: 401 Unauthorized
{
    "message": "Token is not valid"
}
```

### Error 5: Create Task Tanpa Title
```
POST /api/tasks
{
  "description": "No title",
  "priority": "high"
}

Expected:
Status: 400 Bad Request
{
    "message": "Title must be at least 3 characters"
}
```

---

## 📝 Postman Collection (JSON Export)

Untuk memudahkan, export collection:

1. Click collection name → **...** → **Export**
2. Format: **Collection v2.1**
3. Save sebagai `todo-api.postman_collection.json`

Bisa di-import ulang di Postman manapun atau di-share ke team!

---

## 🎓 Dokumentasi untuk Tugas

Siapkan laporan dengan:

1. **Screenshots setiap endpoint** (12 requests: register, login, create 3 task, get all, get single, update, delete, error cases)
2. **Response bodies** lengkap
3. **Status codes** (201, 200, 400, 401)
4. **Kesimpulan:** Semua endpoints tested dan working ✅

---

## 🚨 Troubleshoot

### "Cannot connect to http://localhost:5000"
- Check backend server running (`npm run dev`)
- Check PORT di `.env` backend

### "No token provided"
- Pastikan Authorization header ada
- Format: `Bearer <token>` (with space)
- Copy token dari login response

### "Task not found"
- ID task sudah didelete
- ID user berbeda
- Gunakan task ID yang sebentar dibuat

### CORS Error
- Check localhost:5173 allowed di backend
- Backend sudah configure CORS ✅

---

## ✅ Checklist Testing

- [ ] Backend running (`npm run dev`)
- [ ] Register user baru
- [ ] Login & dapat token
- [ ] Create 3 tasks berbeda priority
- [ ] Get all tasks
- [ ] Get single task by ID
- [ ] Update task (ubah status/priority)
- [ ] Delete task
- [ ] Test error cases (invalid email, no token, etc)
- [ ] Save screenshots
- [ ] Export Postman collection

Semua sukses? Siap submit! 🎉
