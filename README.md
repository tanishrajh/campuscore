
# 🏫 CampusCore – A Unified Smart Campus Hub for SIT

CampusCore is a modern, student-first web application designed to centralize and simplify campus life at **Siddaganga Institute of Technology (SIT), Tumkur)**.
Instead of using scattered WhatsApp groups, Google Forms, random websites, and notices, CampusCore brings everything together in **one clean, intelligent, privacy-friendly platform**.

Made with ❤️ by students, for students.

---

# 🎯 Why CampusCore?

College life is full of small problems:

* Lost ID cards and books
* Wanting to sell or buy textbooks
* Needing a hackathon or study partner
* Confusion about issue reporting (Wi-Fi, classroom, hostel)
* Academic doubts with no proper place to ask
* Too many WhatsApp groups, none reliable

CampusCore solves all of this by giving students a **single portal** that is:

* Verified (SIT email only)
* Simple
* Useful
* Modern
* Campus-exclusive

---

# 🚀 Key Features (Simple Explanation)

## ✔️ 1. Campus-Verified Login

Students log in using their official SIT email ([USN@sit.ac.in](mailto:USN@sit.ac.in)).
And set a password

---

## ✔️ 2. SmartLost – Lost & Found (with image upload)

* Post found items with photos
* Owners can contact finders
* Finder can mark item as “Returned”
* Helps reduce lost belongings on campus

---

## ✔️ 3. PeerConnect – Campus Q&A Forum

* Ask academic questions
* Get answers from peers
* Upvotes + “Best Answer”
* Like StackOverflow, but campus-exclusive

---

## ✔️ 4. Marketplace – Buy & Sell Items

* Books, electronics, hostel items, cycles, etc.
* Upload photos, prices, categories
* Buyers can message sellers
* Safer and more relevant than OLX/WhatsApp

---

## ✔️ 5. GroupUp – Find Teams / Groups / Interests

* Hackathon team search
* Study partners
* Club meets
* Sports groups
* “I’m interested” button + chat with the creator

---

## ✔️ 6. Campus Issue Tracker

A transparent system for reporting problems:

* Wi-Fi issues
* Hostel complaints
* Classroom infrastructure
* Cleanliness, etc.

Features:

* Submit issue with photo
* Public “Me Too” (upvote) button
* Status flow: `Submitted → In Review → In Progress → Resolved`

This helps the campus prioritize student problems.

---

## ✔️ 7. Anonymous + Contextual Chat

Users can chat **without sharing personal contact details**.
The chat automatically knows the context, e.g.:

* “Chat about this lost item”
* “Chat with seller”
* “Chat with GroupUp creator”

This keeps things safe and frictionless.

---

## ✔️ 8. Campus Feed

A live feed that shows:

* Issues reported
* Lost & found updates
* Marketplace listings
* Questions asked
* GroupUp posts

Clicking an item opens a clean modal with a button to jump to the relevant module.

---

## ✔️ 9. Profiles + Gamified Leaderboard

Every student gets a profile with:

* Name / username
* Bio
* Points
* Privacy toggle (hide from leaderboard if you want)

Points are earned for:

* Posting an issue
* Asking questions
* Answering / best answer
* Returning lost items
* Posting listings
* Creating GroupUp posts
* Helping others

Leaderboard shows “Campus Champions” — students who contribute the most.

---

# 🛠️ Technical Overview

## 🔧 Tech Stack

### **Frontend**

* **React + TypeScript**
* **Vite** (blazing fast dev)
* **Tailwind CSS** (custom modern dark theme)
* Responsive UI with glassmorphism and smooth transitions

### **Backend**

Handled entirely by **Supabase**:

* Authentication (magic link with redirect)
* Postgres Database
* Row Level Security (important for campus privacy)
* File Storage (images for marketplace, lost & found, issues)
* Real-time subscriptions (for chat/messages)

### **Deployment**

* **Frontend:** Vercel
* **Backend:** Supabase cloud
* Environment variables stored securely in Vercel

---

# 🗄️ Database Design

### Main Tables

| Table             | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `campus_users`    | Profiles, points, display name, privacy             |
| `issues`          | Campus problem reports with status, location, photo |
| `found_items`     | Lost & Found system                                 |
| `peer_questions`  | Q&A questions                                       |
| `peer_answers`    | Answers + upvotes + best answer                     |
| `market_listings` | Marketplace posts                                   |
| `groupup_posts`   | Team/group search                                   |
| `conversations`   | Chat conversation metadata                          |
| `messages`        | Chat messages                                       |

### Row Level Security (RLS)

All tables use RLS to ensure:

* Students can **only modify their own posts**
* Conversations are private between two users
* Image uploads are scoped to logged-in accounts only

This ensures safety and privacy for campus users.

---

# 🔐 Authentication Flow

1. User enters SIT email
2. Supabase sends a **magic link**
3. Clicking the link returns user to the app
4. Supabase sets secure session in browser
5. Frontend loads user profile & points
6. App shows the Home page (Feed + Navbar)

---

# 🔮 Future Enhancements

CampusCore is designed with scalability in mind.
Next planned improvements:

* Add email verification for enhanced security.
* AI-powered SmartLost matching (CLIP / vector embeddings)
* Push notifications for messages and replies
* Admin dashboard for SIT staff (issue management)
* Mobile app version using Capacitor / React Native
* Timetable + attendance module (optional future)
* Notes / Study resources sharing system
* Clubs dashboard for events + announcements

---

Got you — here’s a short, clean, minimal installation section you can drop directly into your README:


---

🚀 Installation

1. Clone the repo

git clone https://github.com/tanishrajh/campuscore.git
cd campuscore/web

2. Install dependencies

npm install

3. Add environment variables

Create a .env file in the web folder:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

4. Start development server

npm run dev

App will run at:
👉 http://localhost:5173

5. Build for production

npm run build


---

# 🏁 Final Note

CampusCore isn’t just another project —
it’s a **real**, fully functional, production-ready portal that solves actual student problems on campus.

It combines practicality, design, engineering, and real-world usefulness in one polished product.
