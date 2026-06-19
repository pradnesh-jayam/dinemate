# DineMate - Public Launch Setup Guide

This guide will help you get DineMate ready for public launch with Google OAuth authentication and Supabase backend.

## Overview

DineMate now features:
- ✅ Clean, professional login page with Google OAuth
- ✅ Supabase integration for authentication and data storage
- ✅ No demo mode (production-ready)
- ✅ Ready to deploy to Netlify

## Step 1: Set Up Supabase Project

### 1.1 Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with your email or GitHub account
3. Create a new project:
   - Click "New project"
   - Choose an organization
   - Enter project name: `dinemate`
   - Choose a region near your users
   - Set a strong database password
   - Click "Create new project"

### 1.2 Set Up Database Tables

Once your project is created:

1. Go to the SQL Editor
2. Click "New Query"
3. Paste this SQL and run it:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  updated_at TIMESTAMP DEFAULT now()
);

-- Create availability table (dining slots)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  guest TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER DEFAULT 1,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_availability_date_time ON availability(date, time);
CREATE INDEX idx_availability_restaurant ON availability(restaurant_id);
CREATE INDEX idx_availability_created_by ON availability(created_by);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for availability
CREATE POLICY "Anyone can view availability" ON availability
  FOR SELECT USING (true);

CREATE POLICY "Users can insert availability" ON availability
  FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can delete their own availability" ON availability
  FOR DELETE USING (auth.uid() = created_by OR created_by IS NULL);
```

### 1.3 Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon)
2. Click **API**
3. Copy these values:
   - **Project URL** (under "Project URL")->>>https://kpehmmgriyetwadeeusi.supabase.co
   - **Anon Public Key** (under "Project API keys")->>>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwZWhtbWdyaXlldHdhZGVldXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTUwMTksImV4cCI6MjA5NzM3MTAxOX0.Cd6lgH2XCNFVL2d45hZ44KkTMLQvMkZFDKLa0UoJ_tg

Save these - you'll need them in Step 2.

## Step 2: Enable Google OAuth

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Click "Enable APIs and Services"
   - Search for "Google+ API"
   - Click it and press "Enable"
4. Create OAuth 2.0 credentials:
   - Go to **Credentials** menu
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for local testing)
     - `http://127.0.0.1:5173` (for local testing)
     - Your Netlify URL: `https://your-site.netlify.app` (later)
   - Click Create
   - Copy your **Client ID**

### 2.2 Enable Google OAuth in Supabase

1. In your Supabase project, go to **Authentication** → **Providers**
2. Click **Google**
3. Enable it
4. Paste your Google **Client ID**
5. Save

## Step 3: Configure Your App

### 3.1 Create config.js

The `config.js` file in your project should contain your Supabase credentials.

**For local development**, create/update `config.js`:

```javascript
// config.js
window.DINEMATE_SUPABASE_URL = "https://your-project-id.supabase.co";
window.DINEMATE_SUPABASE_ANON_KEY = "your-anon-public-key";
```

**Replace with your actual credentials from Step 1.3**

### 3.2 Test Locally

1. Make sure Node.js is installed
2. In the project directory, run:
   ```bash
   npm start
   # or
   node server.js
   ```
3. Open `http://127.0.0.1:5173`
4. Click "Sign in with Google"
5. You should be redirected to Google login
6. After login, you should land on the choice page

## Step 4: Deploy to Netlify

### 4.1 Prepare for Deployment

1. Create a `.gitignore` file if you don't have one:
   ```
   node_modules
   .env
   .env.local
   config.js
   ```

2. Create a `config.example.js`:
   ```javascript
   // config.example.js - Copy this to config.js and fill in your credentials
   window.DINEMATE_SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
   window.DINEMATE_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";
   ```

### 4.2 Deploy to Netlify

**Option A: Via GitHub (Recommended)**

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect GitHub and select your repository
5. Build settings:
   - Build command: `echo "No build needed"`
   - Publish directory: `.`
6. Click Deploy

**Option B: Via Netlify CLI**

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy
   ```

3. Or for production:
   ```bash
   netlify deploy --prod
   ```

### 4.3 Set Environment Variables on Netlify

1. Go to your Netlify site settings
2. Click "Build & deploy" → "Environment"
3. Add these variables:
   - `DINEMATE_SUPABASE_URL`: Your Supabase URL
   - `DINEMATE_SUPABASE_ANON_KEY`: Your Supabase Anon Key

4. Create a `netlify.toml` in your project root:
   ```toml
   [build]
   publish = "."
   command = "echo 'No build needed'"

   [[headers]]
   for = "/*"
   [headers.values]
   X-Frame-Options = "SAMEORIGIN"
   X-Content-Type-Options = "nosniff"
   X-XSS-Protection = "1; mode=block"
   ```

### 4.4 Update Google OAuth Redirect URI

1. Go back to Google Cloud Console
2. Edit your OAuth credential
3. Add your Netlify URL to **Authorized redirect URIs**:
   - `https://your-site.netlify.app`
4. Save

### 4.5 Update Supabase OAuth Settings

1. Go to your Supabase project → **Authentication** → **Providers** → **Google**
2. Make sure your Google Client ID is still set
3. The redirect URI is automatically handled by Supabase

## Step 5: Launch Checklist

- [ ] Supabase project created and configured
- [ ] Database tables created with RLS policies
- [ ] Google OAuth credentials created
- [ ] Google OAuth enabled in Supabase
- [ ] config.js updated with your credentials
- [ ] App tested locally with Google login
- [ ] Deployed to Netlify
- [ ] Google OAuth redirect URIs updated
- [ ] Tested login on live Netlify URL
- [ ] Domain name configured (optional)

## Troubleshooting

### "Supabase not configured" error
- Check that `config.js` exists and has correct credentials
- Make sure you're using the **Anon Public Key**, not the Service Role key

### Google login redirects to Google but doesn't come back
- Check that your Netlify URL is in Google OAuth's authorized redirect URIs
- Check that Supabase Google provider is enabled
- Check browser console for errors

### Database errors when creating availability
- Make sure the `availability` table exists
- Check that RLS policies are set correctly
- Verify the user is authenticated

### CORS errors
- This shouldn't happen with Supabase, but if it does, check your API settings

## Support

For issues with:
- **Supabase**: Visit https://supabase.com/docs
- **Google OAuth**: Visit https://developers.google.com/identity/protocols/oauth2
- **Netlify**: Visit https://docs.netlify.com

## Next Steps

After launch, consider:
1. Adding a real restaurant database (Google Maps API, Yelp, etc.)
2. Adding more sophisticated matching algorithm
3. Adding notifications when matches are found
4. Adding user profiles and preferences
5. Adding payment processing for premium features

Good luck! 🍽️
