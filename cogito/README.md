## 🧠 Cogito

A modern, scalable blogging platform focused on **thoughtful content, performance, and clean system design**.

Cogito is built to handle real-world usage: authentication, blogs, reactions, comments, follows, saves, rate limiting, and caching — without over-engineering.

---

## ✨ Features

### 📝 Blogging
- Create, update, and delete blogs
- Rich blog content support
- Blog categories (tech, business, lifestyle, education, etc.)
- Blog images via Cloudinary

### ❤️ Engagement
- Like / Dislike system (one reaction per user per blog)
- Save / Unsave blogs
- Engagement score for ranking
- View counts & shares

### 💬 Comments
- Nested comments (replies)
- Edit tracking (`isEdited`)
- Cascade deletes

### 👥 Social
- Follow / Unfollow users (single toggle endpoint)
- Followers & following system
- Scales to hundreds of thousands of users

### 🔔 Notifications
- Unified notification feed (Medium/Twitter-style)
- Notifications for:
  - Blog likes
  - New followers
  - Blog comments
  - Comment replies
- Filtered views: **All / Like / Comment / Reply**
- Read & unread state
- Deep linking to related blog, comment, or profile
- Designed to scale with high user activity

### 🔐 Authentication
- Email & Google OAuth
- JWT-based authentication
- Secure cookie handling

### 🚦 Rate Limiting
- Redis + Lua token bucket
- Per-user & per-IP limits
- Protects APIs from abuse

### ⚡ Performance
- Redis caching for read-heavy endpoints
- Indexed PostgreSQL queries
- Transaction-safe writes

---

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express**
- **PostgreSQL**
- **Prisma ORM**
- **Redis**
- **Lua** (atomic rate limiter)

### Frontend
- **React**
- **TanStack Query**
- Modern component-based UI

### Cloud & Services
- **Cloudinary** – image storage
- **Upstash Redis**
- **Vercel / Railway / Render**

---

## 🗂️ Database Design (High Level)

**Main entities**
- `User`
- `Blog`
- `Follow`
- `Comments`
- `Blogreaction`
- `Savedblogs`
- `Notifications`

**Key decisions**
- Join tables for follows, reactions, saves
- Unique constraints to prevent duplicates
- Indexed foreign keys for fast lookups
- Cascade deletes for data integrity

---

## 🔁 Follow System

- `POST /profile/:name/follow`
- Single endpoint → toggles follow / unfollow
- Backed by DB unique constraint
- Race-condition safe

Scales to **millions of follow relationships**.

---

## 🔐 Rate Limiting Strategy

Implemented using **Redis + Lua**:
- Token bucket algorithm
- One Redis call per request
- Atomic & extremely fast

Limits:
- Blogs → higher capacity
- Comments & user routes → stricter limits

---

## ⚙️ Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://...
REDIS_URL_UPSTASH=redis://...
JWT_SECRET=your_secret
CLOUD_NAME=cloudinary_name
CLOUD_API_KEY=cloudinary_key
CLOUD_API_SECRET=cloudinary_secret
```


---

## 🚀 Scalability

Cogito is designed to handle:

500k+ users

Millions of blogs & comments

Tens of millions of follows & saves


Scaling strategy:

Horizontal API scaling

Read-heavy optimization via Redis

DB indexes instead of in-memory hacks



---

## 🧪 Local Development

npm install
npx prisma generate
npx prisma migrate dev
npm run dev


---

## 📌 Philosophy

Correct data modeling

Simplicity over hype

Real scalability (not fake system design)

Systems that don’t collapse later



---

## 👤 Author

Built by Deepanshu (Cogito) — full-stack developer & UX designer.
