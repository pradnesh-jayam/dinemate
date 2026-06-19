# 🔑 Google Places API Setup - 5 Minutes

## Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com
2. **Sign in with the same Google account you used for Google OAuth**

## Step 2: Create/Select Project
1. Click "Select a Project" at the top left (or your existing project name)
2. Click "NEW PROJECT"
3. Name: `DineMate`
4. Click "CREATE"
5. Wait ~30 seconds for project to be created
6. Click the project card to open it

## Step 3: Enable Places API
1. In left sidebar, click "APIs & Services" → "Enabled APIs & Services"
2. Click "ENABLE APIS AND SERVICES" (blue button at top)
3. **Search:** "Places API"
4. Click "Places API" in results
5. Click "ENABLE" (blue button)
6. Wait for it to enable (~10 seconds)

## Step 4: Create API Key
1. Go back to "APIs & Services"
2. Click "Credentials" in left sidebar
3. Click "CREATE CREDENTIALS" → "API Key"
4. A popup shows your new API key
5. **Copy this key** and save it somewhere safe
6. Click "RESTRICT KEY" (optional but recommended)

## Step 5: Restrict Your Key (Recommended)
1. Click on your new key in the Credentials list
2. Under "Application restrictions" select "HTTP referrers (web sites)"
3. Click "ADD AN ITEM"
4. Enter: `localhost/*`
5. Also add: `127.0.0.1/*`
6. Under "API restrictions" select "Places API"
7. Click "SAVE"

## Step 6: Add to DineMate Config

Open `config.js` and add:
```javascript
window.GOOGLE_PLACES_API_KEY = 'YOUR_API_KEY_HERE';
```

Replace `YOUR_API_KEY_HERE` with the key you copied in Step 4.

Example:
```javascript
window.GOOGLE_PLACES_API_KEY = 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

## Step 7: Test It!

In your browser console (F12), run:
```javascript
console.log(window.GOOGLE_PLACES_API_KEY);
```

Should print your API key. If it does ✅ - you're all set!

---

## 🚨 IMPORTANT: Keep Your Key Secret!

- **Never commit** `config.js` to GitHub (it's in .gitignore)
- **Don't share** your API key
- **Monitor usage** in Google Cloud Console (free tier has limits)
- If key is exposed, delete it and create a new one immediately

---

## 💰 Pricing

**Good news:** Google Places API is FREE for:
- ✅ Place Search (100/month free)
- ✅ Place Details (100/month free)
- ✅ Nearby Search (200/month free)

If you go over free tier, Google will email you before charging.

---

## ❓ Troubleshooting

**Key not working?**
- Check it's in `config.js` with correct format
- Check it's copied correctly (no extra spaces)
- Wait 2-3 minutes after creation

**API says "invalid key"?**
- Verify in Google Cloud Console key exists
- Check your API is **enabled**
- Try creating a new key

**"This API project is not authorized"?**
- Go back to Credentials
- Click your API key
- Check API restrictions = "Places API"
- Click SAVE

---

## ✅ Done!

Your API key is ready. The app will now show **real restaurants** in the dashboard! 🎉

Next: We'll build the dashboard page that uses this key to fetch nearby restaurants.
