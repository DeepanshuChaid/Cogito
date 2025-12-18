🧠 Cogito

A modern, scalable blogging platform focused on thoughtful content, performance, and clean system design.

Cogito is built to handle real-world usage: user authentication, blogs, reactions, comments, follows, saves, rate limiting, and caching — without over-engineering.


---

✨ Features

📝 Blogging

Create, update, and delete blogs

Rich blog content support

Blog categories (tech, business, lifestyle, education, etc.)

Blog images via Cloudinary


❤️ Engagement

Like / Dislike system (one reaction per user per blog)

Save / Unsave blogs

Engagement score for ranking

View counts & shares


💬 Comments

Nested comments (replies)

Edit tracking (isEdited)

Cascade deletes


👥 Social

Follow / Unfollow users (single toggle endpoint)

Followers & following system

Scales to hundreds of thousands of users


🔐 Authentication

Email & Google OAuth

JWT-based authentication

Secure cookie handling


🚦 Rate Limiting

Redis + Lua token bucket

Per-user & per-IP limits

Protects APIs from abuse


⚡ Performance

Redis caching for read-heavy endpoints

Indexed PostgreSQL queries

Transaction-safe writes



---

🏗️ Tech Stack

Backend

Node.js + Express

PostgreSQL (relational data)

Prisma ORM

Redis (caching & rate limiting)

Lua scripts (atomic rate limiter)


Frontend

React

TanStack Query (server state)

Modern component-based UI


Cloud & Services

Cloudinary – image storage

Upstash Redis – managed Redis

Vercel / Railway / Render – deployment



---

🗂️ Database Design (High Level)

Main entities:

User

Blog

Follow

Comments

Blogreaction

Savedblogs


Key design decisions:

Join tables for follows, reactions, saves

Unique constraints to prevent duplicates

Indexed foreign keys for fast lookups

Cascade deletes for data integrity



---

🔁 Follow System

Single endpoint: POST /profile/:name/follow

Automatically toggles follow / unfollow

Backed by a unique DB constraint

Race-condition safe


This design scales to millions of follow relationships.


---

🔐 Rate Limiting Strategy

Implemented using Redis + Lua:

Token bucket algorithm

One Redis call per request

Atomic and extremely fast


Limits:

Blogs: higher capacity

Comments & user routes: stricter limits



---

📦 API Highlights

Blogs

POST /api/blog – create blog

GET /api/blog – fetch blogs

POST /api/blog/:id/save – save blog


Users

POST /profile/:name/follow – follow/unfollow

GET /profile/:name – public profile


Comments

POST /api/comment

Nested replies supported



---

⚙️ Environment Variables

PORT=5000
DATABASE_URL=postgresql://...
REDIS_URL_UPSTASH=redis://...
JWT_SECRET=your_secret
CLOUD_NAME=cloudinary_name
CLOUD_API_KEY=cloudinary_key
CLOUD_API_SECRET=cloudinary_secret


---

🚀 Scalability

Cogito is designed to comfortably handle:

500k+ registered users

Millions of blogs & comments

Tens of millions of follows & saves


Scaling strategy:

Horizontal API scaling

Read-heavy optimization via Redis

Database indexes instead of in-memory hacks



---

🧪 Local Development

npm install
npx prisma generate
npx prisma migrate dev
npm run dev


---

📌 Philosophy

Cogito focuses on:

Correct data modeling

Simplicity over hype

Real scalability, not fake system design

Building things that won’t collapse later



---

👤 Author

Built by Deepanshu chaid (Cogito) — full-stack developer & UX designer.