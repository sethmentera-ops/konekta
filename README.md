# KONEKTA — Bringing People Closer

**KONEKTA** is a modern, international social networking platform designed to connect people authentically across cultures, share thoughts, discover interest-based communities, and communicate privately.

---

## 🌟 Brand Identity

- **Brand Name:** KONEKTA
- **Tagline:** “Bringing People Closer.”
- **Personality:** Friendly, modern, trustworthy, inclusive, international, clear, and recognizable.
- **Color Palette:**
  - **Midnight Navy:** `#101A35`
  - **Royal Blue:** `#1677FF`
  - **Turquoise:** `#57D7F2`
  - **Light Background:** `#F4F7FB`
  - **Main Text:** `#182230`
  - **Secondary Text:** `#667085`
- **Iconography:** Minimalist, geometric interlocking connected nodes rendered in white and turquoise against a navy/royal-blue rounded-square canvas.

---

## 🚀 Key Features

1. **Authentication & Mobile OTP Verification:**
   - Email & password registration with password hashing (`bcryptjs`).
   - International mobile phone authentication supporting E.164 format across all countries (Philippines `+63`, US/Canada `+1`, UK `+44`, Spain `+34`, Japan `+81`, Nigeria `+234`, Germany `+49`, India `+91`, Australia `+61`, Singapore `+65`, etc.).
   - Secure 6-digit SMS OTP generation, 5-minute expiry, 60-second resend cooldown, attempt limits (max 5 tries), and rate limiting.
   - Phone numbers are kept strictly private and never exposed on public profiles.
   - Password reset workflow with secure recovery tokens.

2. **Feed & Content Publishing:**
   - Create, edit, and delete text posts.
   - Responsive photo attachments and presets.
   - Audience visibility controls: **Public**, **Friends Only**, or **Community Group**.
   - Rich interactive reactions: **Like** (👍), **Love** (❤️), **Celebrate** (🎉), and **Support** (🤝).
   - Threaded comments with author deletion privileges.
   - Post sharing and reposts with attribution.
   - Feed filtering: *All Posts*, *Friends Only*, and *Communities*.

3. **Friends & Connections:**
   - Real-time user discovery and search by name or `@username`.
   - Send, accept, decline, and cancel friend requests.
   - Unfriend connection removal.
   - Tabbed view: *My Friends*, *Received Requests*, *Sent Requests*, and *Discover People*.

4. **Communities & Groups:**
   - Create interest-based communities with custom banners, avatars, descriptions, and codes of conduct.
   - **Public Communities:** Anyone can view and join instantly.
   - **Private Communities:** Requires administrative approval. Group administrators can review, approve, or reject membership requests.
   - Members-only discussions feed.

5. **Direct Messaging:**
   - Private 1-on-1 conversations between authorized users.
   - Live message history, unread counters, and timestamps.
   - Strict server-side authorization: unauthorized third parties cannot read messages or access conversation threads.

6. **Safety, Privacy & Moderation:**
   - User blocking: Blocked users cannot message, view posts, or discover profiles.
   - Content and user safety reporting with structured violation categories.
   - Administrative moderation review dashboard.
   - Account deletion with verification safeguard.

7. **Interactive Persona Switcher:**
   - Built-in multi-user switcher (Elena Vance in Manila, Marcus Sterling in London, Sofia Rodriguez in Barcelona, Kenji Sato in Tokyo, Amara Okafor in Lagos) to instantly test multi-party interactions in real time.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend:** Node.js, Express, TSX.
- **Database & Persistence:** Relational disk-persisted database engine with atomic file transactions located at `/data/konekta_db.json`.
- **Security:** `bcryptjs` password hashing, `jsonwebtoken` (JWT) stateless session authorization.

---

## 📂 Project Structure

```
├── data/
│   └── konekta_db.json              # Persistent database storage
├── src/
│   ├── components/
│   │   ├── common/BrandLogo.tsx     # Geometric interlocking logo
│   │   ├── feed/                    # Feed widgets, PostCard, CreatePostCard, EditPostModal, ReportModal
│   │   ├── groups/                  # CreateGroupModal
│   │   ├── navigation/              # Navbar, Sidebar, MobileNav
│   │   └── profile/                 # EditProfileModal
│   ├── context/
│   │   └── AuthContext.tsx          # Authentication state and persona switcher
│   ├── pages/
│   │   ├── LandingPage.tsx          # Brand landing page
│   │   ├── AuthModal.tsx            # Email & International Mobile OTP Auth
│   │   ├── FeedPage.tsx             # Main timeline feed
│   │   ├── ProfilePage.tsx          # User profile view with privacy guard
│   │   ├── FriendsPage.tsx          # Connections & requests
│   │   ├── GroupsPage.tsx           # Communities directory
│   │   ├── GroupDetailPage.tsx      # Community feed, members, admin approvals
│   │   ├── MessagesPage.tsx         # Direct messaging split-screen
│   │   ├── NotificationsPage.tsx    # Live notifications
│   │   ├── SearchPage.tsx           # Unified search
│   │   ├── SettingsPage.tsx         # Privacy, mobile link, blocked accounts
│   │   └── HelpPage.tsx             # Safety center & moderation queue
│   ├── services/
│   │   └── api.ts                   # Centralized API service
│   ├── server/
│   │   ├── api.ts                   # Express REST API routes & permission checks
│   │   ├── db.ts                    # Persistent DB engine & seed generation
│   │   └── types.ts                 # Database schema models
│   ├── types/index.ts               # Frontend TypeScript types
│   ├── App.tsx                      # Root component & tab orchestration
│   ├── index.css                    # Tailwind v4 theme definitions
│   └── main.tsx                     # React DOM entry point
├── server.ts                        # Full-stack server mounting Express & Vite
├── test-konekta.ts                  # Automated test verification suite
└── package.json
```

---

## ⚙️ Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Run automated workflow tests:**
   ```bash
   npx tsx test-konekta.ts
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📱 Mobile SMS OTP Configuration

In production environments, connect an SMS provider (e.g. Twilio, Vonage, or Supabase Auth Phone) by setting the following environment variables:

```bash
SMS_PROVIDER="twilio"               # Provider identifier
TWILIO_ACCOUNT_SID="ACxxxxxxxxx"    # Twilio Account SID
TWILIO_AUTH_TOKEN="xxxxxxxxxxxx"    # Twilio Auth Token
TWILIO_FROM_PHONE="+15551234567"    # Registered Twilio sender number
```

In development, the server generates verified 6-digit codes and displays an interactive preview helper so workflows can be tested seamlessly without incurring SMS costs.
