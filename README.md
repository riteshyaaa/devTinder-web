# 👩‍💻 DevTinder — Frontend

> Tinder for Developers — Find your next coding partner. Swipe, match, and collaborate.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan.svg)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-24%20passing-green.svg)]()

---

## ✨ Features

### Core Experience
- 🔄 **Swipe Animations** — Drag cards with rotation, velocity flick, card stack depth
- 🎉 **"It's a Match!"** — Confetti celebration, pulsing heart, shared skills display
- 🔍 **Smart Matching** — Filter by skills, experience, location + complementary skill matching
- ⭐ **Super Like** — 3/day, shows extra interest
- ⚡ **Boost** — 30-min profile visibility increase
- ↩️ **Undo** — Revert last 3 accidental ignores

### Chat & Communication
- 💬 **Persistent Messages** — Chat history loads from database
- 🟢 **Online Status** — Green dot for live users
- ⌨️ **Typing Indicators** — "User is typing..."
- ✓✓ **Read Receipts** — Sent/Read status
- 😊 **Emoji Reactions** — 8 reactions on any message
- 📎 **File & Image Sharing** — Attach images with preview
- 💻 **Code Snippets** — ``` blocks with copy button
- 📹 **Video Calls** — WebRTC via PeerJS (screen share, mute, timer)
- 💡 **AI Ice Breakers** — Context-aware conversation starters

### Developer-Specific
- 🏷️ **Tech Stack Tags** — 50+ skills, searchable, custom skills
- 🐙 **GitHub Integration** — Repos, stars, languages, followers via API
- 📂 **Portfolio Showcase** — Pin up to 5 projects
- 🎯 **"Looking For"** — Co-founder / Mentor / Hackathon Buddy / etc.
- 🚀 **Project Board** — Post ideas, find collaborators
- ⚡ **Weekly Challenges** — Coding challenges with streaks
- 📊 **Profile Analytics** — Views, match rate, visibility score
- 📝 **Activity Feed** — "What I'm building today" stories

### UX & Polish
- 🎨 **24 Themes** — Dark, Synthwave, Cyberpunk, Nord, etc. with swatches
- 🔔 **Real-time Notifications** — Toast stack + bell dropdown (5 event types)
- 📱 **PWA** — Installable, offline-capable, push notifications
- ♿ **Accessible** — ARIA labels, keyboard nav, screen reader support
- 📐 **Responsive** — Mobile-first, infinite scroll, pull-to-refresh
- ⚡ **Code Split** — React.lazy() for all routes (20+ chunks)
- 🎭 **Animations** — Page transitions, micro-animations, skeleton loading

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite 6 |
| State | Redux Toolkit |
| Routing | React Router 6 |
| Styling | Tailwind CSS + DaisyUI 5 |
| Animations | Framer Motion |
| Real-time | Socket.IO Client |
| Video | PeerJS (WebRTC) |
| HTTP | Axios (interceptors) |
| Testing | Vitest + React Testing Library |
| PWA | Service Worker + manifest.json |

---

## 🏗 Architecture

```
src/
├── App.jsx                 # Routes (lazy-loaded) + Providers
├── main.jsx                # Entry point + theme initialization
├── index.css               # Tailwind + micro-animations + PWA styles
├── components/             # 35 React components
│   ├── Body.jsx            # Layout (NavBar + Outlet + Footer + Toasts)
│   ├── Feed.jsx            # Swipeable cards + filters + undo + boost
│   ├── SwipeableCard.jsx   # Drag-to-swipe with framer-motion
│   ├── MatchModal.jsx      # Celebration screen with confetti
│   ├── Chat.jsx            # Messages + typing + reactions + video
│   ├── VideoCall.jsx       # WebRTC full-screen call UI
│   ├── IceBreakers.jsx     # AI conversation starters
│   ├── ... (30+ more)
├── hooks/                  # Custom hooks
│   ├── useAuth.js          # Login/signup/logout/fetchUser
│   ├── useFeed.js          # Feed + filters + undo + boost + super like
│   ├── useConnections.js   # Connections + retry
│   ├── useRequests.js      # Requests + review
│   ├── useNotifications.js # Socket.IO events → Redux + toasts
│   └── useInfiniteScroll.js
├── services/               # API + external services
│   ├── api.js              # Axios instance + 25 endpoint functions
│   ├── github.js           # GitHub public API client
│   └── cloudinary.js       # Image upload with progress
└── utils/                  # Redux slices + helpers
    ├── appStore.jsx        # 5 Redux slices
    ├── validators.js       # Form validation functions
    ├── rateLimiter.js      # 50 swipes/day client-side
    ├── debounce.js         # Debounce utility + hooks
    └── notificationSlice.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:3000`

### Installation

```bash
git clone https://github.com/riteshyaaa/devTinder-web.git
cd devTinder-web
npm install
```

### Environment

```bash
cp .env.example .env.local
# Set VITE_BASE_URL=http://localhost:3000
```

### Development

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npm test          # Run 24 tests
```

---

## 🧪 Testing

```bash
npm test              # Run all tests (24 passing)
npm run test:watch    # Watch mode
```

| Test File | Tests | What's Covered |
|-----------|-------|----------------|
| Login.test.jsx | 8 | Form render, validation, mode toggle, forgot password |
| Shimmer.test.jsx | 10 | Skeleton, Spinner, ErrorState, EmptyState |
| Feed.test.jsx | 6 | Loading, empty state, card render, boost, filter |

---

## 🚢 Deployment

### Vercel (Recommended)
1. Import repo on [vercel.com](https://vercel.com)
2. Set env: `VITE_BASE_URL=https://your-backend.onrender.com`
3. Deploy ✓

### Netlify
`netlify.toml` is already configured. Just connect the repo.

---

## 📱 PWA

The app is installable on mobile devices:
- Add to Home Screen on iOS/Android
- Offline shell caching via Service Worker
- Push notification support (ready for backend integration)

---

## 🤝 Contributing

1. Fork the repo
2. `git checkout -b feat/your-feature`
3. Write tests: `npm test`
4. Build passes: `npm run build`
5. Commit: `git commit -m "feat: description"`
6. Open a PR

---

## 📄 License

ISC — [Ritesh Yadav](https://github.com/riteshyaaa)
