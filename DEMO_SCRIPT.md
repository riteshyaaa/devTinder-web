# 🎬 DevTinder Demo Video Script

> Duration: ~5 minutes | Target audience: Recruiters, Hiring Managers, Fellow Developers

---

## 🎬 Opening (0:00 - 0:20)

**[Screen: Landing Page]**

"Hi! This is DevTinder — a full-stack social platform I built that connects developers based on their tech skills. Think Tinder, but instead of dating, you're finding your next co-founder, pair programming partner, or mentor."

---

## 1️⃣ Landing & Auth (0:20 - 0:50)

**[Screen: Landing Page → Login]**

- Show the hero section with animated stats
- Click "Get Started"
- Show Login form with validation:
  - Type invalid email → show inline error
  - Type short password → show inline error
- Switch to "Sign Up" → show confirm password field
- Login with: `alex.chen@devtinder.dev` / `Test@1234`

**Key point:** "Cookie-based JWT auth with proper validation and error handling."

---

## 2️⃣ Feed & Swiping (0:50 - 2:00)

**[Screen: Feed with SwipeableCard]**

- Show the developer card with skills badges, GitHub stats, "Currently Building"
- **Drag right** → "INTERESTED" label appears → card flies off
- **Drag left** → "IGNORE" label appears
- Use **arrow keys** to demonstrate keyboard accessibility
- Click **Super Like** (star button) → "2 Super Likes left today"
- Click **Undo** → previous card returns with animation

**Show Filters:**
- Open filter panel
- Toggle "Smart Match" → explain complementary skills
- Select skills: React, Python → feed updates
- Change experience level to "Senior"

**Show Boost:**
- Click "Boost" → timer starts "Boosted (29m)"

**Key point:** "framer-motion animations with velocity-based swipe detection, client-side rate limiting (50/day), and a recommendation system."

---

## 3️⃣ It's a Match! (2:00 - 2:20)

**[Screen: Match Modal]**

- When mutual interest occurs → confetti explosion
- Show both profile photos with pulsing heart
- Show "shared skills" (React, Node.js)
- Click "Send a Message"

**Key point:** "The backend detects mutual matches in real-time and returns `isMatch: true`."

---

## 4️⃣ Chat (2:20 - 3:10)

**[Screen: Chat Page]**

- Show message history (persisted in MongoDB)
- Online indicator (green dot) next to user name
- Type a message → show "typing..." indicator on the other end
- Send a message → appears instantly (Socket.IO)
- Show **read receipts** (✓ Sent → ✓✓ Read)
- Show **code snippet**: type ` ```javascript ` → renders with syntax + copy button
- Click **emoji reaction** (hover → pick 🔥) → appears under message
- Click **video call button** → show full-screen WebRTC UI

**Key point:** "Full real-time chat with Socket.IO — message persistence, typing, reactions, code sharing, and WebRTC video calls."

---

## 5️⃣ Profile (3:10 - 3:50)

**[Screen: Profile Page]**

- Show **Profile Completeness bar** (72%)
- Show **GitHub Integration** (repos, stars, languages with colored dots)
- Show **"Looking For"** tags (Co-founder, Hackathon Buddy)
- Show **Portfolio** section with pinned projects
- Show **Edit Profile**:
  - Skills picker (searchable, custom skills)
  - Cloudinary photo upload with progress bar
  - "Currently Building" field
  - Availability dropdown

**Key point:** "Rich developer profiles with GitHub API integration, gamified completeness, and Cloudinary image upload."

---

## 6️⃣ Community Features (3:50 - 4:20)

**[Screen: Projects → Challenges → Activity → Analytics]**

- **Project Board**: Show posted projects, tech stack tags, "3 developers interested"
- **Weekly Challenges**: Current challenge with difficulty badge, submit button
- **Activity Feed**: Short "What I'm building today" posts
- **Analytics Dashboard**: Views (47), matches (5), match rate (42%), visibility score

**Key point:** "These features create community engagement and give users reasons to come back daily."

---

## 7️⃣ Theme & PWA (4:20 - 4:40)

**[Screen: Theme Toggle → Mobile]**

- Open theme picker → switch to Synthwave, Cyberpunk, Nord
- Show color swatches preview
- Show "Add to Home Screen" prompt (PWA)
- Show responsive design on mobile viewport

**Key point:** "24 themes persisted in localStorage, PWA with offline support and push notifications."

---

## 🎬 Closing (4:40 - 5:00)

**[Screen: Architecture/Code]**

"Under the hood: React 18 with Redux Toolkit on the frontend, Node.js + Express + MongoDB on the backend, Socket.IO for real-time, PeerJS for video calls, and a full test suite with 24 frontend tests and Artillery load testing.

The entire thing is deployed on Vercel (frontend) and Render (backend) with Docker support. Check the README for the full architecture diagram."

**End card:** GitHub links to both repos.

---

## 📝 Recording Tips

- Use 1920x1080 resolution
- Open browser DevTools and set device to "Responsive" for mobile demo
- Clear localStorage before recording (fresh theme/state)
- Run `npm run seed` before recording for realistic data
- Use browser extension to slow down for drag animations
- Record in 2 takes: first half (Feed/Match/Chat), second half (Profile/Community)
