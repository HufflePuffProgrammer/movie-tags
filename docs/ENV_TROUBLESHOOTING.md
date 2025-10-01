# Environment Variables Troubleshooting

## 🚨 Error: "supabaseKey is required"

This error means one of your Supabase environment variables is missing or not being loaded properly.

## ✅ **Step 1: Check Your .env.local File**

Your `.env.local` file should be in the **root directory** of your project (same level as `package.json`) and contain:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# TMDB API Configuration (optional for now)
TMDB_API_KEY=your-tmdb-api-key-here
```

## 🔍 **Step 2: Verify Your Supabase Keys**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings > API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 **Step 3: Common Issues & Solutions**

### Issue 1: File Location
❌ **Wrong**: `.env.local` in a subfolder  
✅ **Correct**: `.env.local` in project root

```
movie-tags/
├── .env.local          ← HERE
├── package.json
├── app/
└── components/
```

### Issue 2: File Name
❌ **Wrong**: `.env`, `.env.development`, `env.local`  
✅ **Correct**: `.env.local` (with the dot at the beginning)

### Issue 3: Variable Names
❌ **Wrong**: `SUPABASE_URL`, `SUPABASE_KEY`  
✅ **Correct**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue 4: No Quotes Needed
❌ **Wrong**: `NEXT_PUBLIC_SUPABASE_URL="https://..."`  
✅ **Correct**: `NEXT_PUBLIC_SUPABASE_URL=https://...`

### Issue 5: No Spaces
❌ **Wrong**: `NEXT_PUBLIC_SUPABASE_URL = https://...`  
✅ **Correct**: `NEXT_PUBLIC_SUPABASE_URL=https://...`

## 🔄 **Step 4: Restart Development Server**

After creating/updating `.env.local`:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## 🐛 **Step 5: Debug Output**

With the updated `supabase-server.ts`, you should see this in your console:

```
🔧 Supabase Server Config: {
  hasUrl: true,
  hasAnonKey: true,
  hasServiceKey: true,
  url: 'https://abcdefghijk.supabase...'
}
✅ Supabase server clients initialized successfully
```

If you see `false` values, those environment variables are missing.

## 📝 **Step 6: Create .env.local Template**

Create this file in your project root:

```bash
# Copy this template and fill in your actual values

# Get these from: https://supabase.com/dashboard → Your Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Get this from: https://www.themoviedb.org/settings/api (optional)
TMDB_API_KEY=
```

## 🚨 **Still Having Issues?**

1. **Check the console output** - Look for the debug messages
2. **Verify file exists**: `ls -la .env.local` (Mac/Linux) or `dir .env.local` (Windows)
3. **Check file contents**: Make sure there are no extra characters or encoding issues
4. **Try absolute paths**: Verify you're in the correct directory

## 🔒 **Security Note**

- Never commit `.env.local` to git
- The `.env.local` file should be in your `.gitignore`
- Only share environment variables through secure channels
