# Tiny Linker – URL Shortener Web Application

A production-ready Bit.ly style URL shortener built as a full-stack application using **Next.js, Prisma, and PostgreSQL (Neon)**. The system allows authenticated users to shorten URLs, manage links, and analyze click performance with advanced features such as custom aliases, expiry control, QR codes, and password-protected links.

---

## 🚀 Live Demo

Add your deployed URL here:

```
https://tiny-linker.vercel.app
```

---

## 📌 Core Features

### URL Shortening

* Generate short URLs automatically
* Custom short aliases (e.g. /promo-2025)

### Link Management

* View all created links
* Delete individual links
* Copy link to clipboard

### Click Analytics

* Total click count
* Daily click statistics (line chart)
* Last clicked timestamp

### Security & Control

* User authentication (NextAuth)
* User-isolated links
* Password-protected links
* Link expiry dates

### Extra Enhancements

* QR code generation
* Responsive dashboard UI
* Protected routes

---

## 🧠 Technology Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| Frontend       | Next.js (App Router) |
| Backend        | Next.js API Routes   |
| Authentication | NextAuth             |
| Database       | PostgreSQL (Neon)    |
| ORM            | Prisma               |
| Styling        | Tailwind CSS         |
| Charts         | Chart.js             |
| QR Codes       | qrcode.react         |
| Deployment     | Vercel               |

---

## 🏗️ System Architecture

```
Client (Browser)
   ↓
Next.js UI Layer
   ↓
Next.js API Routes (Server)
   ↓
Prisma ORM
   ↓
PostgreSQL (Neon DB)
```

Authentication and session handling are managed server-side using secure JWT sessions via NextAuth. Each user only accesses their own data.

---

## 📁 Project Structure

```
tiny_linker/
│
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── links/route.ts
│   │   ├── links/[id]/route.ts
│   │
│   ├── [shortCode]/route.ts
│   ├── login/page.tsx
│   ├── page.tsx
│   └── layout.tsx
│
├── lib/
│   ├── prisma.ts
│   ├── shortCode.ts
│   └── auth.ts
│
├── prisma/
│   └── schema.prisma
│
├── types/next-auth.d.ts
└── .env
```

---

## 🔐 Authentication Flow

1. User logs in via /login
2. NextAuth validates credentials
3. Session is created
4. Protected pages enforce authentication

---

## 🔄 Redirect Flow

```
User visits /abc123
   ↓
System validates URL
   ↓
Checks expiry & password
   ↓
Logs analytics
   ↓
Redirects to original URL
```

---

## ⚙️ Environment Variables (.env)

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

---

## 🔌 API Documentation

### Base URL

```
http://localhost:3000/api
```

(Production: your Vercel domain)

---

### ✅ POST /links

Create a new shortened URL

**Request Body (JSON):**

```json
{
  "originalUrl": "https://example.com/article",
  "customCode": "my-link",
  "expiresAt": "2025-12-31T23:59:00Z",
  "password": "optional-password"
}
```

**Response 201:**

```json
{
  "id": "clx123...",
  "shortCode": "my-link",
  "originalUrl": "https://example.com/article",
  "clickCount": 0
}
```

Errors:

* 400 → Invalid URL or bad custom code
* 409 → Short code already exists
* 401 → Unauthorized

---

### ✅ GET /links

Retrieve all links for logged-in user

Response:

```json
[
  {
    "id": "clx123",
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "clickCount": 5,
    "lastClicked": "2025-11-20T12:30:00Z"
  }
]
```

---

### ✅ DELETE /links/{id}

Delete a specific link

Response:

```json
{ "success": true }
```

---

### ✅ GET /links/{id}/stats

Daily click analytics for a URL

Response:

```json
[
  { "date": "2025-11-20", "count": 4 },
  { "date": "2025-11-21", "count": 7 }
]
```

---

### ✅ Redirect Route

```
GET /{shortCode}
```

Behaviour:

* Redirects to original URL
* Tracks click statistics
* Validates expiry & password

---

### Production URL Structure

```
https://your-project.vercel.app/login
https://your-project.vercel.app/dashboard
https://your-project.vercel.app/abc123
```

---

## 🛠️ Running Locally

### 1. Install Dependencies

```
npm install
```

### 2. Setup Prisma

```
npx prisma migrate dev\ nnpx prisma generate
```

### 3. Start Development Server

```
npm run dev
```

App will run at:

```
http://localhost:3000
```

---

## ✅ Key Highlights

* Clean separation of frontend, backend, and data layers
* Secure authentication and access control
* Production-ready routing and analytics
* Real-world SaaS feature set
* Scalable architecture

---

## 📈 Possible Future Enhancements

* Admin dashboard
* API access tokens
* Team collaboration
* Rate limiting
* Bulk URL uploads

---

## 👨‍💻 Developer Notes

AI tools were used as development assistants, but all logic, structure, and integration decisions were validated, implemented, and understood manually to ensure code clarity and maintainability.

---

## 📬 Contact

Developer: Sri Chakradhar
Email: [gsrichakradhar1@gmail.com](mailto:gsrichakradhar1@gmail.com)
GitHub: [https://github.com/Sri-Chakradhar/tiny_linker](https://github.com/Sri-Chakradhar/tiny_linker)

---

This project demonstrates modern full-stack engineering practices with real-world SaaS capabilities and production-level architecture.