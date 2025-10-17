# Metanoia 🚀  

Metanoia is a **mobile-first job matching app** that reimagines how **job seekers** and **HR/recruiters** connect.  
Think of it as a **Tinder for jobs** – swipe, match, and chat your way into the perfect opportunity or hire.   

Metanoia also integrates **AI-driven matching, referrals, and automation** to create a modern recruitment experience.  
 
---

## 📢 Status
⚠️ This app is currently **in progress** and not yet live.  
👉 All **ideas, design, flow, features, and logic were conceptualized by me**.  
👉 The app code is being developed with AI assistance to speed up execution.  
💡 In the near future, expect Metanoia to evolve into a **new generation hiring platform**.  


---

## 🌟 Features  

- 🔐 **Firebase Authentication** – secure sign-in system.  

- 🧭 **Onboarding Flow**  
  - Candidate: 9-step onboarding (profile, education, skills, etc.).  
  - HR/Recruiter: 12-step onboarding (company details, hiring needs, culture).  
  - **100% profile completion** required before swiping.  

- 🎯 **Role Selection** – Candidate vs HR at the start.  

- 🌍 **Location Selector** – use GPS or custom city for **remote swiping**.  

- 👩‍💼 **Swipe-to-Match**  
  - Candidates swipe through HR profiles.  
  - HR swipes through candidate profiles.  
  - If both swipe right → it’s a **match** and candidate is shortlisted.  

- 💬 **In-App Chat**  
  - Real-time messaging.  
  - ✅ **Automated Scheduling** – suggest interview times directly inside chat.  
  - 📩 **One Free Referral per Day** – candidates can request referrals in chat, with optional contact email.  

- 🎁 **Referral & Rewards System**  
  - Invite friends and earn **priority swipes** & **visibility boosts**.  
  - Daily **free referral system** enforced automatically.  

- 🎨 **Modern UI** – built with `react-native-paper`, animated progress bars, and custom theming.  

- 📄 **Profile Media Uploads**  
  - Upload **photos, resumes (PDF/DOC)**, and media.  
  - Stored securely with **Firebase Storage**.  

- 🔔 **Notifications**  
  - Powered by **Expo Notifications** for new matches, messages, and referral updates.  

---

## 🧠 Algorithms & Logic  

- **AI Matching Algorithm**  
  - Matches candidates ↔ jobs using:  
    - Skills  
    - Experience  
    - Recruiter preferences  
  - Future: expand with **NLP + ML** for deeper resume & job description analysis.   

- **Referral Limiter**  
  - `todayKey` system → **1 free referral/day**.  
  - Stored & validated in **Firestore**.  

- **Automated Interview Scheduler**  
  - Suggests interview slots directly in chat.  
  - Integrated into chat workflow.  

- **Notification Triggers**  
  - Fires on: match, message, referral sent.  

---

## 🛠️ Tech Stack  

- **Frontend**: React Native (Expo)  
- **Navigation**: React Navigation  
- **UI**: react-native-paper + custom components  
- **Backend**: Firebase (Firestore + Auth + Storage)  
- **Notifications**: Expo Notifications  
- **Location**: Expo Location API  
- **State Management**: React Context (`OnboardingContext`)  

---

## 📱 Screens  

- **Onboarding** – guided setup for Candidate & HR.  
- **Swipe Screen** – card-based swiping UI.  
- **Chat Screen** –  
  - Real-time chat  
  - Interview scheduler  
  - Referral system  
- **Profile Management** – editable info + resume/media upload.  

---

## 🚀 Getting Started  

### Prerequisites  
- Node.js & npm/yarn  
- Expo CLI  
- Firebase project (Firestore + Auth + Storage enabled)  

### Installation  

```bash
# Clone repository
git clone https://github.com/ujwal1616/metanoia.git  

# Navigate into project
cd metanoia


# Install dependencies
npm install  

# Run with Expo
expo start  
