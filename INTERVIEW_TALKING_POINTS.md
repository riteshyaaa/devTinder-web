# 🎤 DevTinder — Interview Talking Points

Use these when discussing the project in technical interviews.

---

## 🏗 System Design Questions

### "Walk me through the architecture."

> "It's a React SPA with Redux Toolkit talking to a Node.js/Express backend over REST + WebSocket. MongoDB for storage. The frontend uses code splitting with React.lazy — 20 chunks loaded on demand. Socket.IO provides real-time events for chat, typing, online status, and notifications. PeerJS handles WebRTC video calls without a media server."

### "How do you handle authentication?"

> "JWT stored in an httpOnly cookie with 7-day expiry. The backend has an auth middleware that verifies the token and attaches the user to `req.user`. On the frontend, a 401 interceptor on axios auto-redirects to login. For password reset, I generate a 6-digit token with 15-minute TTL, sent via Nodemailer."

### "How does matching work?"

> "When User A swipes right on User B, I check if B already swiped right on A. If yes, both requests are auto-accepted and the API returns `isMatch: true`. The frontend then shows the celebration modal with confetti. All done in a single DB query — no background jobs needed."

### "How do you handle scalability?"

> "Feed queries exclude users with existing connections using a `$nin` filter. I added indexes on `skills`, `experienceLevel`, `lastActive`, and the compound index on `fromUserId + toUserId`. The cache layer (currently in-memory, designed for Redis swap) caches feed results for 5 minutes. Rate limiting prevents abuse. Pagination on all list endpoints."

---

## 💻 Frontend Questions

### "Why framer-motion for the swipe?"

> "I needed velocity-based gesture detection — not just distance threshold but also how fast the user flicked. framer-motion's `useMotionValue` + `useTransform` gives me real-time transforms without re-renders, and `animate()` returns a Promise so I can chain async actions after the fly-off animation."

### "How do you manage state?"

> "Redux Toolkit for global state that multiple components need: user auth, feed array, connections, notifications (5 slices). Local component state for UI-only concerns like form inputs, loading flags. Custom hooks encapsulate the bridge between Redux and API calls."

### "Explain your testing strategy."

> "24 unit tests with Vitest + React Testing Library covering form validation, UI states (loading, error, empty), and component rendering. The setup mocks framer-motion, socket.io, and IntersectionObserver. Backend has integration tests with Supertest hitting real MongoDB, plus Socket.IO event tests with socket.io-client."

### "How do you handle errors?"

> "Three layers: (1) Axios interceptor catches 401s globally. (2) `getErrorMessage()` utility extracts human-readable errors from any response shape. (3) React ErrorBoundary at the app root catches unhandled JS errors and shows a recovery UI instead of white screen."

---

## 🔌 Backend Questions

### "Explain your Socket.IO architecture."

> "One singleton connection per user. On connect, the user registers with their ID — I track them in a Map for online status. Chat uses room-based messaging (room ID = SHA256 hash of sorted user IDs). Messages are persisted to MongoDB on send AND emitted to the room simultaneously. Typing indicators and reactions are ephemeral (no DB write)."

### "How do you handle the feed algorithm?"

> "The feed excludes users with any existing connection request (both directions). Then it applies skill/experience/location filters from query params. Smart sort: boosted users first (cron expires stale boosts), then by `lastActive` descending. Profile view counts are incremented atomically for analytics."

### "Rate limiting approach?"

> "Four tiers using express-rate-limit: auth (10/15min), swipes (50/hour), messages (60/min), general (100/min). Each returns a JSON error with a friendly message. Client-side mirrors the swipe limit with localStorage tracking (for UX — server is the source of truth)."

### "How would you deploy this?"

> "Frontend on Vercel (auto-deploys from main, SPA rewrites via vercel.json). Backend on Render with the included render.yaml or Docker. MongoDB Atlas for the database (managed, auto-scaling). Environment variables configured per platform. The seed script populates 50 realistic users for demos."

---

## 🧠 Behavioral / Problem-Solving

### "What was the hardest bug?"

> "Socket.IO memory leak in the Chat component. The original code created a NEW socket connection on every `sendMessage()` call — never cleaned up. Messages would occasionally duplicate or not deliver. Fixed by using `useRef` to store the socket from the initial `useEffect` and reusing it across all event handlers."

### "What would you improve?"

> "1) TypeScript for type safety across the stack. 2) React Query for server-state caching (would eliminate most of my Redux code). 3) Redis for the cache layer to support horizontal scaling. 4) Playwright E2E tests for critical flows. 5) A proper CI pipeline with GitHub Actions."

### "How did you decide what to build first?"

> "I categorized features into 3 tiers by impact. Tier 1 (must-have): core swiping, matching, chat — the minimum viable loop. Tier 2 (engagement): notifications, themes, undo — things that make users come back. Tier 3 (differentiation): video calls, challenges, analytics — what makes it portfolio-worthy. Fixed critical bugs first, then worked tier by tier."

### "Why this project?"

> "I wanted to demonstrate the full spectrum: real-time communication (Socket.IO + WebRTC), animation engineering (framer-motion), API design (30+ endpoints), state management at scale (Redux + 5 slices), and modern DevOps (Docker, CI, PWA). Plus it solves a real problem I've experienced — finding the right developer to collaborate with."

---

## 📈 Metrics to Mention

- **12,000+ lines of frontend code** across 35 components
- **4,000+ lines of backend code** with 30+ API endpoints
- **20 Socket.IO events** for real-time features
- **24/24 frontend tests passing**
- **30+ backend integration tests**
- **3.6s build time** with 20-chunk code splitting
- **195KB gzipped** initial bundle
- **50 req/sec sustained** in load testing
- **24 themes** with instant switching
- **PWA score** — installable on mobile

---

## 🎯 Quick Elevator Pitch (30 seconds)

> "DevTinder is a full-stack Tinder clone for developers. Swipe on profiles, match based on complementary skills, chat in real-time with code sharing, and even video call for pair programming. I built it solo with React, Node.js, MongoDB, and Socket.IO. It has 35 components, 30 API endpoints, WebRTC video calls, push notifications, and 24 tests. It's deployed on Vercel and Render."
