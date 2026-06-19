# 🍽️ DineMate 2.0 - Complete Redesign Plan

## Phase 1: UI/UX Redesign (TODAY - ~6 hours)
Complete redesign of login, signup, and main dashboard UI

## Phase 2: Features (TOMORROW)
Location search, restaurant API, request system, bookings

---

## 📋 USER FLOW

```
1. LANDING PAGE
   ├─ Check if user is logged in
   └─ If NO → Show Login/Signup
   └─ If YES → Redirect to Location Search

2. LOGIN/SIGNUP
   ├─ First timer? → Signup with Google OAuth
   │  └─ Fill Profile: name, phone, gmail (optional), occupation (optional), photo (optional)
   │
   └─ Returning user? → Login with Google OAuth
      └─ Go to Location Search

3. LOCATION SEARCH PAGE
   ├─ "Where do you want to eat?" (search by city/area name)
   ├─ Show autocomplete suggestions
   └─ User selects location → Go to Dashboard

4. DASHBOARD
   ├─ IF slots available at location:
   │  ├─ Show restaurants with available slots
   │  ├─ Show people's profiles who want to dine
   │  ├─ Request button to invite people
   │  └─ Add your own slot option
   │
   └─ IF NO slots at location:
      ├─ "No dining slots available in [location]"
      ├─ Show 5 nearest locations with slots (list view)
      ├─ Allow user to change location
      └─ Show suggestion to add their own slot

5. RESTAURANT DETAIL
   ├─ Show all available slots
   ├─ People profiles for each slot
   ├─ Request to join button
   └─ Add new slot option

6. USER PROFILE
   ├─ Personal info
   ├─ Booked slots (confirmed meetings)
   ├─ Pending requests (incoming/outgoing)
   ├─ Cancel/Accept buttons
   └─ Edit profile

7. NAVIGATION
   ├─ Home (Dashboard)
   ├─ Search Location
   ├─ My Profile
   ├─ My Bookings
   └─ Sign Out
```

---

## 🎨 UI COMPONENTS TO BUILD TODAY

### 1. Landing Page
```
┌─────────────────────────────────┐
│    🍽️ DineMate                   │
│  Find Your Dining Partner        │
│                                 │
│  [Sign In with Google]           │
│  [New? Sign Up with Google]      │
│                                 │
│  "Find restaurants & meet      │
│   people who want to dine"      │
└─────────────────────────────────┘
```

### 2. Signup Form
```
┌─────────────────────────────────┐
│  Create Your Profile             │
│                                 │
│  Name: [__________]            │
│  Phone: [__________]           │
│  Email: [__________] (optional) │
│  Occupation: [__________] (opt) │
│  Photo: [Upload] (optional)    │
│                                 │
│  [Complete Profile]             │
└─────────────────────────────────┘
```

### 3. Location Search Page
```
┌─────────────────────────────────┐
│  📍 Where do you want to eat?    │
│                                 │
│  [Search: New Delhi ▼]          │
│  ├─ New Delhi
│  ├─ New Delhi NCR
│  └─ Gurgaon
│                                 │
│  [Search for Dining]            │
└─────────────────────────────────┘
```

### 4. Dashboard (Slots Available)
```
┌─────────────────────────────────┐
│  🎯 Dining in New Delhi          │
│  [Search] [Change Location]     │
│                                 │
│  3 Available Slots Near You      │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🍴 Saffron Table             ││
│  │ North Indian | 0.7km away    ││
│  │                              ││
│  │ 👤 Aisha Raman               ││
│  │ Today, 7:30 PM | 1 seat      ││
│  │ "Open to recommendations"    ││
│  │                              ││
│  │ [Request to Join] [Add Slot] ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🍣 Nori & Rice               ││
│  │ Japanese | 1.3km away        ││
│  │ ... more slots ...           ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### 5. Dashboard (No Slots)
```
┌─────────────────────────────────┐
│  🎯 Dining in [Location]         │
│                                 │
│  ❌ No dining slots available    │
│     in this location             │
│                                 │
│  Available in nearby areas:      │
│                                 │
│  1. New Delhi - 5 slots         │
│  2. Gurgaon - 3 slots           │
│  3. Noida - 2 slots             │
│  4. Delhi NCR - 8 slots         │
│  5. Faridabad - 1 slot          │
│                                 │
│  [Add Your Own Slot]            │
│  [Change Location]              │
└─────────────────────────────────┘
```

### 6. User Profile
```
┌─────────────────────────────────┐
│  👤 My Profile                   │
│                                 │
│  [Photo]                        │
│  Aisha Raman                    │
│  📱 +91 98765 43210             │
│  💼 Product Manager             │
│  📧 aisha@gmail.com             │
│                                 │
│  ┌─ Booked Slots (2) ────────────┐
│  │ Saffron Table - Today 7:30 PM  │
│  │ with Vikram Sen                │
│  │                                │
│  │ Nori & Rice - Jun 20, 8:00 PM  │
│  │ with Sarah Khan                │
│  └────────────────────────────────┘
│                                 │
│  ┌─ Pending Requests (1) ────────┐
│  │ Sarah wants to join you at     │
│  │ Casa Fresca - 7:00 PM          │
│  │                                │
│  │ [Accept] [Decline]             │
│  └────────────────────────────────┘
│                                 │
│  [Edit Profile] [Sign Out]      │
└─────────────────────────────────┘
```

---

## 📊 DATABASE SCHEMA UPDATES

### New Tables Needed:
1. **user_profiles** (already exists as 'profiles')
   - Add: phone, occupation, photo_url

2. **dining_requests** (NEW)
   ```sql
   - id: UUID
   - from_user_id: UUID (requester)
   - to_user_id: UUID (recipient)
   - slot_id: UUID (which slot)
   - status: 'pending' | 'accepted' | 'declined'
   - created_at, updated_at
   ```

3. **booked_slots** (NEW)
   ```sql
   - id: UUID
   - user_id_1: UUID
   - user_id_2: UUID
   - slot_id: UUID
   - restaurant_id: text
   - confirmed_at
   ```

---

## 🎯 TASKS FOR TODAY

### Task 1: Update Login/Signup UI
- ✅ Create landing page with login/signup toggle
- ✅ Update signup form with new fields
- ✅ Add profile completion page after signup

### Task 2: Location Search Page
- ✅ Create search box with autocomplete
- ✅ Store selected location in user profile
- ✅ Navigation to dashboard after selection

### Task 3: Dashboard UI
- ✅ Create responsive dashboard layout
- ✅ Show "No slots" message with alternatives
- ✅ Show slots with people profiles (card design)
- ✅ Add "Request to Join" button (no functionality yet)
- ✅ Add "Add Slot" button

### Task 4: User Profile Page
- ✅ Display user info
- ✅ Show booked slots section (static for now)
- ✅ Show pending requests section (static for now)
- ✅ Navigation menu

### Task 5: Styling & Design
- ✅ Modern color palette
- ✅ Card-based design
- ✅ Mobile responsive
- ✅ Smooth animations
- ✅ Clear typography

---

## 📦 FILES TO MODIFY/CREATE TODAY

### New Files:
```
signup.html              (Profile creation page)
location.html            (Location search page)
dashboard.html           (Main app view)
profile.html             (User profile page)
styles-redesign.css      (New modern styles)
redesign.js              (UI logic & navigation)
```

### Modify:
```
index.html               (Landing page with login/signup)
app.js                   (Add profile logic, location handling)
supabase-schema.sql      (Add new tables)
```

---

## 🎨 DESIGN PRINCIPLES

1. **Modern & Clean** - Minimalist, spacious layout
2. **Card-Based** - Everything in cards with shadows
3. **Color Scheme**:
   - Primary: #2457c5 (Blue)
   - Accent: #087f8c (Teal)
   - Success: #4f7d38 (Green)
   - Neutral: #f6f8fb (Light gray bg)

4. **Typography**:
   - Headers: Bold, large
   - Body: Clear, readable
   - Actions: Button primary colors

5. **Spacing**:
   - Generous padding (24px, 32px)
   - Clear visual hierarchy
   - Mobile-first responsive

---

## ⏱️ TIMELINE

**Phase 1 (Today)**: 6-8 hours
- [ ] Landing page redesign (1 hour)
- [ ] Signup/Profile form (1.5 hours)
- [ ] Location search page (1.5 hours)
- [ ] Dashboard UI (2 hours)
- [ ] Profile page UI (1 hour)
- [ ] Styling & responsiveness (1 hour)

**Phase 2 (Tomorrow)**: 8-10 hours
- [ ] Integrate Google Places API
- [ ] Location autocomplete
- [ ] Build request system
- [ ] Bookings system
- [ ] Real-time notifications
- [ ] Testing & polish

---

## ✨ WHAT THIS GIVES YOU

By end of today:
- ✅ Professional, modern UI
- ✅ Complete user flow
- ✅ Responsive on mobile/desktop
- ✅ Login → Profile → Location → Dashboard flow
- ✅ Beautiful restaurants & people display
- ✅ Ready for feature implementation tomorrow

By end of tomorrow:
- ✅ Full working app
- ✅ Location-based search
- ✅ Request system
- ✅ Bookings & confirmations
- ✅ Ready to launch! 🚀

---

**Ready to start? Let's build this! 🍽️**
