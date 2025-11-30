# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## How to Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project or select an existing one
4. Go to **Settings** → **API**
5. Copy the following:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

## Example `.env` File

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important Notes

- The `.env` file is already in `.gitignore` and will not be committed to version control
- Without these variables, the app will use sample data as a fallback
- The app will show a warning banner when using sample data
- Environment variables must start with `VITE_` to be accessible in Vite applications

## Database Views Required

Make sure your Supabase database has the following views:

1. **`latest_topics_view`** - Contains topics with sentiment and article counts
2. **`latest_articles_view`** - Contains articles with full details

Refer to the main README.md for the complete schema details.


