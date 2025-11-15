Got you — here is your full README, exactly as you provided earlier, with the Installation section inserted cleanly before the Final Note.
This is the complete file — copy-paste directly into GitHub.


---

🏫 CampusCore – A Unified Smart Campus Hub for SIT

CampusCore is a modern, student-first web application designed to centralize and simplify campus life at Siddaganga Institute of Technology (SIT), Tumkur).
Instead of using scattered WhatsApp groups, Google Forms, random websites, and notices, CampusCore brings everything together in one clean, intelligent, privacy-friendly platform.

Made with ❤️ by students, for students.


---

🎯 Why CampusCore?

College life is full of small problems:

Lost ID cards and books

Wanting to sell or buy textbooks

Needing a hackathon or study partner

Confusion about issue reporting (Wi-Fi, classroom, hostel)

Academic doubts with no proper place to ask

Too many WhatsApp groups, none reliable


CampusCore solves all of this by giving students a single portal that is:

Verified (SIT email only)

Simple

Useful

Modern

Campus-exclusive



---

🚀 Key Features (Simple Explanation)

✔️ 1. Campus-Verified Login

Students log in using their official SIT email (USN@sit.ac.in) and set a password.


---

✔️ 2. SmartLost – Lost & Found (with image upload)

Post found items with photos

Owners can contact finders

Finder can mark item as “Returned”

Helps reduce lost belongings on campus



---

✔️ 3. PeerConnect – Campus Q&A Forum

Ask academic questions

Get answers from peers

Upvotes + “Best Answer”

Like StackOverflow, but campus-exclusive



---

✔️ 4. Marketplace – Buy & Sell Items

Books, electronics, hostel items, cycles, etc.

Upload photos, prices, categories

Buyers can message sellers

Safer and more relevant than OLX/WhatsApp



---

✔️ 5. GroupUp – Find Teams / Groups / Interests

Hackathon team search

Study partners

Club meets

Sports groups

“I’m interested” button + chat with the creator



---

✔️ 6. Campus Issue Tracker

A transparent system for reporting problems:

Wi-Fi issues

Hostel complaints

Classroom infrastructure

Cleanliness, etc.


Features:

Submit issue with photo

Public “Me Too” (upvote) button

Status flow: Submitted → In Review → In Progress → Resolved



---

✔️ 7. Anonymous + Contextual Chat

Users can chat without sharing personal contact details.
The chat automatically knows the context:

Chat about a lost item

Chat with seller

Chat with GroupUp creator



---

✔️ 8. Campus Feed

A live feed showing:

Issues

Listings

Lost items

Q&A

GroupUp posts


Clicking an item opens a modal with quick actions.


---

✔️ 9. Profiles + Gamified Leaderboard

Each student has:

Username

Bio

Points

Privacy toggle


Points are earned for:

Asking questions

Answering

Posting issues

Returning lost items

Posting listings

Creating GroupUp posts


Leaderboard highlights top contributors.


---

🛠️ Technical Overview

🔧 Tech Stack

Frontend

React + TypeScript

Vite

Tailwind CSS

Modern dark UI, glassmorphism, animations


Backend (Supabase)

Auth

Postgres

RLS

Storage (images)

Realtime (chat)


Deployment

Frontend: Vercel

Backend: Supabase



---

🗄️ Database Design

Main Tables

Table	Purpose

campus_users	Profiles, points, display name, privacy
issues	Campus problem reports with status, location, photo
found_items	Lost & Found system
peer_questions	Q&A questions
peer_answers	Answers + upvotes + best answer
market_listings	Marketplace posts
groupup_posts	Team/group search
conversations	Chat conversation metadata
messages	Chat messages


Row Level Security

Users can only modify their own data

Conversations restricted to participants

Image uploads restricted to logged-in users



---

🔐 Authentication Flow

1. User enters SIT email


2. Supabase verifies and logs them in


3. Password-based login persists session


4. App loads personalized data




---

⚙️ Installation

1. Clone the repo

git clone https://github.com/tanishrajh/campuscore.git
cd campuscore/web

2. Install dependencies

npm install

3. Add environment variables

Create a .env file inside the web folder:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

4. Start the development server

npm run dev

Runs at: http://localhost:5173

5. Build for production

npm run build


---

🏁 Final Note

CampusCore isn’t just another project —
it’s a real, fully functional, production-ready portal that solves actual student problems on campus.

It combines practicality, design, engineering, and real-world usefulness in one polished product.


---