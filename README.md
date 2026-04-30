# AI-Guided Data Structures & Algorithms Learning Platform

🎯 An intelligent platform that guides users through DSA problem-solving with AI-powered hints and feedback, without revealing complete solutions.

## 🚀 Features

- **AI-Guided Code Solving**: Get contextual hints and validations as you code
- **Smart Hint Engine**: Layered hints that adapt to your progress
- **Skill Tracking**: Adaptive learning system that tracks your strengths and weaknesses
- **Code Visualization**: Step-by-step execution and variable tracking
- **Gamification**: XP, streaks, and badges to keep you motivated
- **Mock Interview Mode**: Practice with AI interviewer

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Monaco Editor
- **Backend**: Next.js API Routes
- **AI**: Google Gemini API
- **Database**: MongoDB with Mongoose

## 📦 Installation

```bash
npm install
```

## 🏃 Running the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file:

```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Get your free Gemini API key from: https://makersuite.google.com/app/apikey

## 📝 Project Structure

```
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and configurations
├── models/          # Database models
├── types/           # TypeScript types
└── public/          # Static assets
```

