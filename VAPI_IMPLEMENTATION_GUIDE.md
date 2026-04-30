# Vapi AI Interview Feature - Implementation Guide

## 📋 Current Status

Your project already has a **solid foundation** for the Vapi AI interview feature! Here's what's already implemented:

✅ **Completed:**
- Vapi SDK installed (`@vapi-ai/web`)
- Agent component with voice call functionality
- Interview creation flow
- Question generation using Gemini AI
- Feedback generation system
- Database models (Interview & Feedback)
- Server actions for interview management

## 🔧 Issues to Fix

### 1. **Critical Bug: Property Name Mismatch**

**Location:** `components/Agent.tsx` (lines 65-66)

**Problem:** The code uses `interview.role` but the database schema uses `jobRole`.

**Fix Required:**
```typescript
// Current (WRONG):
`You are an interviewer for ${interview.role}...`
`You are a setup assistant for ${interview.role}...`

// Should be:
`You are an interviewer for ${interview.jobRole}...`
`You are a setup assistant for ${interview.jobRole}...`
```

### 2. **Missing Feedback Display Page**

**Location:** `app/interview/[interviewId]/feedback/page.tsx` (doesn't exist)

**Problem:** The Agent component redirects to `/interview/${interview.id}/feedback` after generating feedback, but this page doesn't exist.

**Fix Required:** Create a feedback display page that shows:
- Total score
- Final assessment
- Strengths
- Areas for improvement
- Full transcript

### 3. **Environment Variable Setup**

**Location:** `.env.local` (needs to be created/updated)

**Problem:** Vapi requires a public API key that's not configured.

**Fix Required:**
```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
```

**How to get it:**
1. Sign up at https://vapi.ai
2. Go to your dashboard
3. Get your Public API Key
4. Add it to `.env.local`

### 4. **Vapi Configuration Improvements**

**Location:** `components/Agent.tsx`

**Current Issues:**
- No error handling for Vapi initialization failures
- No voice/audio configuration
- Event listeners might be duplicated
- Missing call-end handler for feedback generation

**Improvements Needed:**
- Add proper error handling
- Configure voice settings (voice model, language)
- Handle edge cases (network errors, permission denied)
- Improve transcript collection logic

### 5. **Transcript Collection Logic**

**Location:** `components/Agent.tsx` (lines 18-30)

**Issue:** The transcript collection only works when `isGenerated` is true, but messages should be collected in both phases.

**Fix:** Collect messages in both setup and interview phases.

## 📝 Step-by-Step Implementation Checklist

### Phase 1: Fix Critical Bugs

- [ ] **Fix property name bug** in `Agent.tsx`
  - Change `interview.role` to `interview.jobRole` (2 occurrences)

- [ ] **Create feedback page**
  - Create `app/interview/[interviewId]/feedback/page.tsx`
  - Fetch feedback data using `getFeedbackByInterviewId`
  - Display score, assessment, strengths, improvements, and transcript

- [ ] **Set up environment variable**
  - Add `NEXT_PUBLIC_VAPI_PUBLIC_KEY` to `.env.local`
  - Verify it's accessible in the browser (NEXT_PUBLIC_ prefix)

### Phase 2: Enhance Vapi Integration

- [ ] **Improve Agent component**
  - Add error handling for Vapi initialization
  - Add voice configuration (voice model, language, speed)
  - Fix event listener cleanup
  - Improve transcript collection for both phases
  - Add loading states and error messages

- [ ] **Add Vapi webhook support** (optional but recommended)
  - Create API route for Vapi callbacks
  - Handle call events server-side
  - Store call metadata

### Phase 3: User Experience Improvements

- [ ] **Add audio controls**
  - Mute/unmute button
  - Volume control
  - Audio quality indicator

- [ ] **Improve UI feedback**
  - Show connection status
  - Display real-time transcript
  - Show question progress
  - Add timer for interview duration

- [ ] **Add error recovery**
  - Retry mechanism for failed calls
  - Network error handling
  - Permission denied handling (microphone access)

### Phase 4: Testing & Polish

- [ ] **Test interview flow**
  - Test setup phase (question generation)
  - Test interview phase (voice conversation)
  - Test feedback generation
  - Test feedback display

- [ ] **Add analytics** (optional)
  - Track interview completion rates
  - Monitor call quality
  - Track user engagement

## 🛠️ Detailed Implementation

### 1. Fix Agent.tsx Property Bug

**File:** `components/Agent.tsx`

Replace lines 65-66:
```typescript
const systemPrompt = isGenerated 
  ? `You are an interviewer for ${interview.jobRole}. Ask these questions one by one: ${interview.questions.join(", ")}`
  : `You are a setup assistant for ${interview.jobRole}. Ask the user: "How many questions would you like to practice today?" and wait for a number.`;
```

### 2. Create Feedback Page

**File:** `app/interview/[interviewId]/feedback/page.tsx`

```typescript
import { db } from "@/lib/newdb";
import { auth } from "@clerk/nextjs/server";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { notFound } from "next/navigation";

export default async function FeedbackPage({ 
  params 
}: { 
  params: { interviewId: string } 
}) {
  const { userId } = auth();
  if (!userId) return notFound();

  const feedback = await getFeedbackByInterviewId({
    interviewId: params.interviewId,
    userId,
  });

  if (!feedback) return notFound();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Interview Feedback</h1>
        
        {/* Score */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Overall Score</h2>
          <div className="text-6xl font-black text-indigo-500">
            {feedback.totalScore}/100
          </div>
        </div>

        {/* Assessment */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Final Assessment</h2>
          <p className="text-gray-300 leading-relaxed">{feedback.finalAssessment}</p>
        </div>

        {/* Strengths */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Strengths</h2>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, i) => (
              <li key={i} className="text-gray-300 flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Areas for Improvement</h2>
          <ul className="space-y-2">
            {feedback.areasForImprovement.map((area, i) => (
              <li key={i} className="text-gray-300 flex items-start gap-2">
                <span className="text-yellow-500">→</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Transcript */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Full Transcript</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Array.isArray(feedback.transcript) && feedback.transcript.map((msg: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg ${
                msg.role === 'user' ? 'bg-indigo-500/20' : 'bg-gray-800/50'
              }`}>
                <div className="font-bold text-sm mb-1">
                  {msg.role === 'user' ? 'You' : 'Interviewer'}
                </div>
                <div className="text-gray-300">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Enhanced Agent Component

**Key improvements to make:**

1. **Fix transcript collection:**
```typescript
useEffect(() => {
  const handleMessage = (msg: any) => {
    if (msg.type === "transcript" && msg.transcriptType === "final") {
      setTranscript(msg.transcript);
      // Collect messages in both phases
      setMessages((prev) => [...prev, { 
        role: msg.role, 
        content: msg.transcript 
      }]);
    }
  };

  vapi.on("call-start", () => setStatus("calling"));
  vapi.on("call-end", () => {
    setStatus("idle");
    // Auto-generate feedback if interview was completed
    if (isGenerated && messages.length > 2) {
      handleEndInterview();
    }
  });
  vapi.on("message", handleMessage);
  
  return () => {
    vapi.off("call-start");
    vapi.off("call-end");
    vapi.off("message", handleMessage);
    void vapi.stop();
  };
}, [isGenerated, messages.length]);
```

2. **Add error handling:**
```typescript
const startCall = async () => {
  try {
    const systemPrompt = isGenerated 
      ? `You are an interviewer for ${interview.jobRole}. Ask these questions one by one: ${interview.questions.join(", ")}`
      : `You are a setup assistant for ${interview.jobRole}. Ask the user: "How many questions would you like to practice today?" and wait for a number.`;

    await vapi.start({
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }],
      },
      voice: {
        provider: "11labs", // or "deepgram", "azure", etc.
        voiceId: "default", // Choose a voice
      },
    });
  } catch (error) {
    console.error("Failed to start call:", error);
    alert("Failed to start call. Please check your microphone permissions.");
  }
};
```

3. **Add voice configuration:**
```typescript
vapi.start({
  model: {
    provider: "openai",
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }],
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Example voice ID
  },
  firstMessage: isGenerated ? undefined : "Hello! How many questions would you like to practice today?",
});
```

## 🔑 Environment Variables Required

Create/update `.env.local`:

```env
# Existing
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

# Vapi (NEW - REQUIRED)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

# Clerk (if using)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

## 📚 Vapi Documentation References

- **Getting Started:** https://docs.vapi.ai/
- **Web SDK:** https://docs.vapi.ai/guides/web-sdk
- **Voice Models:** https://docs.vapi.ai/guides/voice
- **API Reference:** https://docs.vapi.ai/api-reference

## 🚨 Common Issues & Solutions

### Issue 1: "Vapi is not defined"
**Solution:** Ensure `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set and the component is client-side (`"use client"`)

### Issue 2: Microphone not working
**Solution:** 
- Check browser permissions
- Use HTTPS (required for microphone access)
- Test in Chrome/Firefox (best support)

### Issue 3: Call not starting
**Solution:**
- Verify API key is correct
- Check browser console for errors
- Ensure you're on HTTPS or localhost

### Issue 4: Transcript not collecting
**Solution:**
- Check that `transcriptType === "final"` in message handler
- Verify messages are being added to state
- Check network tab for Vapi API calls

## ✅ Testing Checklist

Before deploying, test:

1. **Interview Creation**
   - [ ] Can create new interview
   - [ ] Form validation works
   - [ ] Redirects to interview room

2. **Setup Phase**
   - [ ] Voice call starts
   - [ ] Can hear AI assistant
   - [ ] Can speak and be heard
   - [ ] Number input is detected
   - [ ] Questions are generated
   - [ ] Page refreshes to interview mode

3. **Interview Phase**
   - [ ] Interview starts automatically
   - [ ] Questions are asked one by one
   - [ ] Transcript is collected
   - [ ] Can end interview

4. **Feedback Phase**
   - [ ] Feedback is generated
   - [ ] Redirects to feedback page
   - [ ] All feedback data displays correctly
   - [ ] Transcript is readable

## 🎯 Priority Order

1. **HIGH PRIORITY** (Must fix to work):
   - Fix `interview.role` → `interview.jobRole` bug
   - Add `NEXT_PUBLIC_VAPI_PUBLIC_KEY` to `.env.local`
   - Create feedback page

2. **MEDIUM PRIORITY** (Improves experience):
   - Enhance Agent component with error handling
   - Improve transcript collection
   - Add voice configuration

3. **LOW PRIORITY** (Nice to have):
   - Add audio controls
   - Add analytics
   - Add webhook support

## 📞 Next Steps

1. **Immediate:** Fix the 3 critical issues above
2. **Short-term:** Test the complete flow end-to-end
3. **Long-term:** Add enhancements based on user feedback

---

**Need help?** Check the Vapi documentation or review the example implementations in their GitHub repository.

