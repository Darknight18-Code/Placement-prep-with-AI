# Google Gemini API Setup Guide

## Overview

The platform now uses **Google Gemini Pro** for AI-powered code analysis and hints. Gemini is free to use and provides excellent code analysis capabilities.

## Getting Your Free API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select "Create API key in new project" (or existing project)
   - Copy your API key

3. **Add to Environment Variables**
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

## Free Tier Limits

Google Gemini offers generous free tier:
- **60 requests per minute**
- **1,500 requests per day**
- Perfect for development and small-scale usage

## Model Used

- **Model**: `gemini-pro`
- **Features**: Code analysis, hint generation, complexity analysis
- **Response Format**: JSON (with fallback to text parsing)

## Configuration

The AI service is configured in `lib/ai.ts`:

```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,      // Creativity level
    topP: 0.95,            // Nucleus sampling
    topK: 40,              // Top-k sampling
    maxOutputTokens: 1024, // Max response length
  },
});
```

## Troubleshooting

### Issue: "API key not found"
- **Solution**: Add `GEMINI_API_KEY` to your `.env.local` file
- Restart your dev server after adding

### Issue: "Quota exceeded"
- **Solution**: You've hit the free tier limit
- Wait for the rate limit to reset (60/min, 1500/day)
- Consider upgrading to paid tier if needed

### Issue: "Invalid API key"
- **Solution**: Verify your API key is correct
- Make sure there are no extra spaces
- Regenerate key if needed

## Benefits of Gemini

✅ **Free tier** - No credit card required  
✅ **Generous limits** - 60/min, 1500/day  
✅ **High quality** - Excellent code analysis  
✅ **Fast responses** - Low latency  
✅ **JSON support** - Structured responses  

## Migration from OpenAI

If you were using OpenAI before:
- Remove `OPENAI_API_KEY` from `.env.local`
- Add `GEMINI_API_KEY` instead
- No code changes needed - already migrated!

For more information, visit: https://ai.google.dev/

