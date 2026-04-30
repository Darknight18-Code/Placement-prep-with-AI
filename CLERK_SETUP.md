# Clerk Authentication Setup Guide

## Overview

The platform uses Clerk for authentication, which provides:
- Email/password authentication
- Social OAuth (Google, GitHub, etc.)
- User management
- Session management
- Built-in security features

## Setup Steps

### 1. Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose "Next.js" as your framework

### 2. Get Your API Keys

From your Clerk Dashboard:
- **Publishable Key** (starts with `pk_`)
- **Secret Key** (starts with `sk_`)

### 3. Configure Environment Variables

Add to your `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Customize Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/problems
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/problems

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/ai-dsa-platform

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Configure OAuth Providers (Optional)

In Clerk Dashboard:
1. Go to **User & Authentication** → **Social Connections**
2. Enable **Google** (or other providers)
3. Follow the setup instructions for each provider

## Features

### ✅ What's Included

1. **Sign In/Sign Up Pages**
   - Located at `/sign-in` and `/sign-up`
   - Built-in Clerk components with Google OAuth support
   - Automatic redirect after authentication

2. **Protected Routes**
   - Middleware protects routes automatically
   - Public routes: `/`, `/api/problems`, `/api/problems/seed`

3. **User Sync**
   - Automatically syncs Clerk users with your MongoDB database
   - Creates user records with skills, XP, streaks, badges
   - API route: `/api/users/sync`

4. **API Route Protection**
   - Use `auth()` from `@clerk/nextjs` to get current user
   - Example: `const { userId } = auth();`

5. **AuthContext**
   - Wraps Clerk functionality
   - Provides `useAuth()` hook with user data, loading state, signOut
   - Automatically syncs with database

## Usage Examples

### Client-Side (React Components)

```tsx
import { useAuth } from "@clerk/nextjs";
import { useAuth as useCustomAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { isSignedIn, signOut } = useAuth();
  const { user, loading } = useCustomAuth();

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>XP: {user?.xp}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Server-Side (API Routes)

```tsx
import { auth } from "@clerk/nextjs";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your protected logic here
}
```

### Protected Pages

```tsx
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) return null;

  return <div>Protected content</div>;
}
```

## File Structure

```
├── contexts/
│   └── AuthContext.tsx          # Custom auth context wrapper
├── app/
│   ├── sign-in/
│   │   └── [[...sign-in]]/      # Clerk sign-in page
│   ├── sign-up/
│   │   └── [[...sign-up]]/      # Clerk sign-up page
│   └── api/
│       └── users/
│           └── sync/            # User sync endpoint
├── middleware.ts                 # Route protection
└── app/layout.tsx               # ClerkProvider setup
```

## Troubleshooting

### Issue: "Clerk: Missing publishableKey"
- **Solution**: Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env.local`
- Restart your dev server after adding env variables

### Issue: User not syncing to database
- **Solution**: Check that `/api/users/sync` route is working
- Ensure `CLERK_SECRET_KEY` is set correctly
- Check browser console for errors

### Issue: OAuth not working
- **Solution**: Verify OAuth provider is enabled in Clerk Dashboard
- Check redirect URLs are configured correctly
- Ensure environment variables are set

### Issue: Middleware not protecting routes
- **Solution**: Ensure `middleware.ts` is in the root directory
- Check that public routes are correctly configured
- Restart dev server

## Next Steps

1. ✅ Set up your Clerk account
2. ✅ Add environment variables
3. ✅ Test sign-in/sign-up flows
4. ✅ Configure OAuth providers (optional)
5. ✅ Customize Clerk components (optional)

For more information, visit [Clerk Documentation](https://clerk.com/docs)

