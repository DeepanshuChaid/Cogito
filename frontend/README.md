# 🧠 Cogito — Frontend Architecture

**Next.js (App Router) + TanStack Query**

A production-grade frontend architecture built to respect a real backend:
Prisma, PostgreSQL, Redis, rate limiting, caching, and scale.

This is **scalable, and system-driven**.

---

## 🎯 Goals

- Mirror backend domain logic cleanly
- Keep frontend maintainable as features grow
- Avoid over-engineering while staying future-proof

---

## 🗂️ Project Structure

```txt
src/
│
├── app/                         # ROUTING & PAGE COMPOSITION
│   ├── layout.tsx               # Root layout
│   ├── providers.tsx            # QueryClient, Auth context
│   ├── globals.css
│
│   ├── page.tsx                 # Home feed (blogs)
│
│   ├── (auth)/                  # Route groups
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│
│   ├── blog/
│   │   ├── page.tsx             # Explore blogs
│   │   ├── [slug]/
│   │   │   ├── page.tsx         # Single blog
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│
│   ├── write/
│   │   └── page.tsx             # Create / edit blog
│
│   ├── profile/
│   │   └── [name]/page.tsx      # User profile
│
│   └── not-found.tsx
│
├── features/                    # DOMAIN-BASED LOGIC (CORE)
│   ├── auth/
│   │   ├── api.ts
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── types.ts
│
│   ├── blog/
│   │   ├── api.ts               # REST calls
│   │   ├── queries.ts     tions.ts
│   │   └── types.ts
│
│   ├── social/
│   │   ├── api.ts               # follow / unfollow
│   │   ├── mutations.ts
│   │   └── queries.ts
│
│   └── reaction/
│       ├── api.ts
│       └── mutations.ts
│
├── components/
│   ├── ui/                      # PURE UI (shadcn-like)
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Skeleton.tsx
│
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogHeader.tsx
│   │   ├── BlogActions.tsx      # like / save / share
│   │   └── BlogEditor.tsx
│
│   ├── comment/
│   │   ├── CommentItem.tsx
│   │   └── CommentTree.tsx
│
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   └── FollowButton.tsx
│
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── lib/                         # APP INFRA
│   ├── queryClient.ts
│   ├── axios.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   └── constants.ts
│
├── hooks/                       # REUSABLE LOGIC
│   ├── useAuth.ts
│   ├── useInfiniteBlogs.ts
│   └── useIntersection.ts
│
├── utils/
│   ├── formatDate.ts
│   ├── slugify.ts
│   └── debounce.ts
│
├── types/
│   └── index.ts
│
└── middleware.ts                # Auth protection (optional)
```