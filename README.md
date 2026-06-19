# DineMate

DineMate is a lightweight web app for finding nearby restaurants and matching with people who are available to dine at the same place and time.

## ✨ Features

- 🔐 **Google OAuth Sign In** - Secure authentication with Google
- 🍽️ **Restaurant Discovery** - Browse nearby restaurants with ratings and vibes
- 📅 **Availability Management** - Post when you're free to dine out
- 👥 **Smart Matching** - Find dining partners with overlapping times and locations
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Supabase Powered** - Real-time data sync and authentication
- 🚀 **Ready for Production** - Clean, professional UI optimized for public launch

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js installed
- Supabase project (optional for local testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dinemate.git
cd dinemate
```

2. Create your config file:
```bash
cp config.example.js config.js
# Edit config.js and add your Supabase credentials (optional)
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to:
```
http://127.0.0.1:5173
```

## 📋 Public Launch Setup

For a complete guide on setting up Supabase, Google OAuth, and deploying to production, see **[SETUP_GUIDE.md](SETUP_GUIDE.md)**.

### Quick Steps:
1. Create a Supabase project
2. Set up Google OAuth credentials
3. Configure environment variables
4. Deploy to Netlify (or your hosting provider)

## 📁 Project Structure

```text
index.html           → Google OAuth login page
choice.html          → Main action hub
dashboard.html       → Overview of restaurants & matches
programs.html        → Restaurant discovery & filtering
meetings.html        → All dining availability
create-meeting.html  → Add your availability
join-meeting.html    → Quick restaurant join
speakers.html        → Potential dining matches
app.js               → Core app logic, state, auth
styles.css           → Responsive UI
config.js            → Supabase credentials (not in Git)
server.js            → Local development server
```

## 🔐 Authentication

- **Google OAuth**: Primary sign-in method via Supabase
- **Supabase Auth**: Handles secure authentication
- **Row-Level Security**: Database access controlled per user

## 🗄️ Database (Supabase)

The app uses two main tables:
- **profiles**: User account information
- **availability**: Dining availability slots

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for full SQL schema.

## 🎨 UI Features

- Clean, modern design
- Dark-aware color palette
- Touch-friendly buttons
- Fast, responsive interactions
- Accessibility-first HTML

## 🛠️ Development

Edit these files to customize:
- **styles.css** - Appearance and layout
- **app.js** - Business logic and state management
- **HTML files** - Page structure and content

## 📱 Deployment

Ready to deploy? Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for:
- Netlify deployment
- Environment variable setup
- SSL/HTTPS configuration
- Custom domain setup

## 📝 License

MIT License - Feel free to use this project as a foundation for your own apps.

## 💡 Future Enhancements

Potential features for v2:
- Real restaurant database integration (Google Maps, Yelp)
- Advanced matching algorithm
- Push notifications
- User profiles and preferences
- Reviews and ratings
- Payment processing
