# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud like MongoDB Atlas)
- Google Gemini API key (free at https://makersuite.google.com/app/apikey)

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-dsa-platform
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your free Gemini API key from: https://makersuite.google.com/app/apikey

   For MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-dsa-platform
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Seed Sample Problems**
   
   Visit: `http://localhost:3000/api/problems/seed` in your browser
   
   Or use the "Seed Sample Problems" button on the problems page if no problems exist.

5. **Access the Application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── problems/          # Problem pages
│   ├── dashboard/         # User dashboard
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── CodeEditor.tsx    # Monaco editor component
│   ├── ProblemViewer.tsx # Problem display component
│   └── Navigation.tsx    # Navigation bar
├── lib/                   # Utilities
│   ├── ai.ts             # Google Gemini integration
│   ├── db.ts             # MongoDB connection
│   └── utils.ts          # Helper functions
├── models/                # Mongoose models
│   ├── User.ts
│   ├── Problem.ts
│   └── Submission.ts
└── types/                 # TypeScript types
```

## Features Implemented

✅ **Core Features:**
- Code editor with Monaco Editor
- Problem viewer with examples and constraints
- AI-powered code analysis
- Layered hint system (4 levels)
- Problem filtering by difficulty and topic
- Sample problems seeding

✅ **AI Features:**
- Code analysis with approach validation
- Complexity analysis (time/space)
- Edge case suggestions
- Optimization hints
- Strict no-solution policy

✅ **UI/UX:**
- Responsive design
- Dark mode support
- Modern, clean interface
- Real-time feedback

## Next Steps (Future Enhancements)

- [ ] User authentication system
- [ ] Skill tracking and adaptive learning
- [ ] Code execution and visualization
- [ ] Mock interview mode
- [ ] Voice-based reasoning
- [ ] PDF quiz generator
- [ ] Gamification (XP, streaks, badges) - UI ready, needs backend integration

## Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running locally, or
- Check your MongoDB Atlas connection string

**Gemini API Errors:**
- Verify your API key is correct
- Get your free API key from: https://makersuite.google.com/app/apikey
- Ensure the API key has proper permissions
- Check if you've exceeded free tier limits

**Build Errors:**
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Run `npm run dev`

