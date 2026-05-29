# 📋 DevTinder — Portfolio Case Study

## Project Overview

**DevTinder** is a full-stack developer networking platform where developers can connect based on complementary skills, collaborate on projects, and build professional relationships through a familiar swipe-based interface.

| Aspect | Details |
|--------|---------|
| **Type** | Full-stack web application |
| **Role** | Sole developer (design, frontend, backend, deployment) |
| **Duration** | ~4 weeks |
| **Status** | Production-ready, deployed |
| **Lines of Code** | ~12,000+ (frontend) + ~4,000+ (backend) |
| **Frontend Tests** | 24 passing |
| **Backend Tests** | 30+ (auth, feed, requests, chat, socket) |

---

## 🎯 Problem Statement

Developers often struggle to find:
- **Pair programming partners** with complementary skills
- **Co-founders** for side projects
- **Mentors** in their area of interest
- **Hackathon teammates** on short notice

Existing platforms (LinkedIn, Twitter) are too broad. DevTinder solves this by focusing exclusively on developer-to-developer connections with skill-based matching.

---

## 🏗 Architecture Decisions

### Why This Tech Stack?

| Decision | Reasoning |
|----------|-----------|
| **React + Vite** | Fast HMR, modern ESM, excellent DX. React for component ecosystem |
| **Redux Toolkit** | Predictable state for complex flows (feed, notifications, auth) |
| **Framer Motion** | Production-quality animations (swipe, confetti, page transitions) |
| **Socket.IO** | Mature WebSocket library with fallback, rooms, namespaces |
| **MongoDB** | Flexible schema for evolving user profiles (skills, GitHub, portfolio) |
| **PeerJS** | WebRTC abstraction — video calls without media server cost |
| **DaisyUI** | 24 themes for free + accessible components built on Tailwind |

### Key Architectural Patterns

1. **Custom Hooks Pattern** — Separated business logic from UI:
   - `useFeed()` — swipe, undo, super like, boost, filter
   - `useAuth()` — login, signup, logout, session management
   - `useNotifications()` — socket events → Redux + toasts

2. **API Service Layer** — Centralized axios instance with:
   - Global 401 interceptor (auto-redirect to login)
   - Error message extraction utility
   - Typed endpoint functions

3. **Singleton Socket** — One socket connection shared across the app for:
   - Online status tracking
   - Typing indicators
   - Notifications
   - Chat messages

4. **Smart Feed Algorithm** — Backend sorts by:
   - Boosted profiles first
   - Recently active users
   - Profile completeness score
   - Fair exposure (view count tracking)

---

## 💡 Technical Challenges & Solutions

### 1. Swipe Gesture Detection

**Challenge:** Making drag gestures feel natural on both touch and mouse.

**Solution:** Used framer-motion's `useMotionValue` + `useTransform` for real-time rotation/opacity during drag, combined with velocity-based detection (`info.velocity.x > 500`) for quick flicks. Spring physics for snap-back when below threshold.

### 2. Real-time Match Detection

**Challenge:** Two users swipe right at different times — how to detect the match instantly?

**Solution:** On every "interested" request, the backend checks if a reverse request already exists:
```javascript
const reverseRequest = await ConnectionRequest.findOne({
  fromUserId: toUserId, toUserId: fromUserId, status: "interested"
});
if (reverseRequest) { /* auto-accept both → isMatch: true */ }
```
Frontend shows the celebration modal when `isMatch: true` is returned.

### 3. Chat Message Persistence + Real-time

**Challenge:** Messages need to be both persisted (survive refreshes) AND delivered instantly.

**Solution:** Dual approach:
- Socket.IO `sendMessage` → saves to MongoDB AND emits to room
- `GET /chat/:targetId` → loads history on page load
- Read receipts: `messageRead` event → bulk `updateMany` in DB

### 4. Rate Limiting Without Frustrating Users

**Challenge:** Prevent abuse while keeping legitimate users happy.

**Solution:** 4-tier rate limiting:
- Auth: 10/15min (brute-force protection)
- Swipes: 50/hour (engagement pacing)
- Messages: 60/min (spam prevention)
- General: 100/min (DDoS protection)

Client-side shows remaining count and friendly error messages.

### 5. GitHub Integration Without Auth

**Challenge:** Show GitHub data without requiring OAuth (reduces sign-up friction).

**Solution:** Used GitHub's unauthenticated public API (60 req/hour limit). Fetches profile + repos on-demand when user enters username. Aggregates languages from repos, calculates total stars, extracts top 3 repos. Saved to user profile for display on cards.

---

## 📊 Key Metrics (Architecture)

| Metric | Value |
|--------|-------|
| Frontend chunks | 20+ (code-split via React.lazy) |
| Initial bundle | ~195KB gzip (main JS) |
| Build time | 3.6 seconds |
| Lighthouse PWA | Installable, offline-capable |
| API endpoints | 30+ |
| Socket.IO events | 20 |
| Database indexes | 12 (optimized queries) |
| Rate limit tiers | 4 |
| Themes | 24 |
| Components | 35 |
| Custom hooks | 6 |

---

## 🧠 What I'd Do Differently

1. **TypeScript from day 1** — Would catch many bugs at compile time
2. **React Query instead of Redux for server state** — Less boilerplate for API caching
3. **Redis from the start** — In-memory cache doesn't scale horizontally
4. **GraphQL** — Would reduce over-fetching on the feed endpoint
5. **E2E tests (Playwright)** — More confidence in user flows

---

## 🎓 What I Learned

- WebRTC is complex — PeerJS abstracts the hard parts but debugging ICE failures is still challenging
- Socket.IO rooms are powerful but you must clean up event listeners carefully (memory leaks)
- Framer Motion's `useMotionValue` is more performant than state-driven animations
- Rate limiting UX matters — show remaining count, not just block with an error
- Profile completeness gamification actually drives engagement (known from Tinder/LinkedIn research)

---

## 🔮 Future Enhancements

If I had more time:
- **AI-powered matching** using embeddings (skills → vectors → cosine similarity)
- **Push notifications** via Firebase Cloud Messaging
- **Group projects** with shared Kanban boards
- **Code review feature** — share PRs for feedback from connections
- **Mobile app** (React Native — 80% code reuse from hooks/services)
