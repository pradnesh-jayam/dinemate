# 🍽️ DineMate Phase 2 - Core Features Plan
## Focus: Restaurants + Time Slots + User Profiles (TODAY)
## Time Estimate: 3-4 hours | Realistic completion: Today ✅

---

## 📋 Phase 2 Breakdown

### Part A: Database Updates (30 min) ✅
- [ ] Add `dining_slots` table (restaurant, location, date/time, capacity, created_by)
- [ ] Add `slot_members` table (slot_id, user_id, joined_at)
- [ ] Add `dining_requests` table (from_user, to_user, slot_id, status)
- [ ] Update `profiles` table (add phone, occupation if not present)
- [ ] Create RLS policies for security

### Part B: Dashboard Page (90 min) ✅
Shows restaurants + available time slots at selected location

**Dashboard Features:**
```
Location: Bangalore
[Scroll through restaurants]

Restaurant Card:
├─ Restaurant name & photo
├─ Rating & distance
├─ "2 SLOTS AVAILABLE" badge
├─ Slot 1: 6:30 PM | 2 people going → Join/View Button
├─ Slot 2: 8:00 PM | 1 person going → Join/View Button
└─ "+ CREATE SLOT" button

When user clicks "Join":
├─ Show 2 people's profiles (name, photo, occupation)
├─ "Request this person" button on each
├─ "View more" to see full profile
└─ Join confirmation
```

**Dashboard Sections:**
1. Header: Location selector + profile icon
2. Restaurant list: Fetch from Google Places API
3. For each restaurant: Show available time slots
4. Join/Create slot buttons
5. Toast notifications (joined, request sent, etc.)

### Part C: Profile Cards (60 min) ✅
When user clicks on someone in a slot

**Profile Card Shows:**
- Profile photo
- Name
- Occupation
- Phone (hidden, revealed on request)
- Rating (from previous connections)
- "Send Request" button
- "View Full Profile" link
- Close button

### Part D: Booking Modal (60 min) ✅
When user clicks "Create Slot"

**Create Slot Form:**
```
Restaurant: [Selected]
Location: [Selected]
Date: [Date picker]
Time: [Time picker - 30 min intervals]
Party Size: [Dropdown 1-6]
Notes: [Optional text]

[Cancel] [Create Slot]
```

**Join Slot Flow:**
```
Slot: 6:30 PM at Restaurant Name
People: 2 (show their photos)
Your party size: [1] [2] [3] [etc]
[Cancel] [Join Slot]
```

---

## 🗄️ Database Schema Changes

### New Table: dining_slots
```sql
CREATE TABLE dining_slots (
  id uuid PRIMARY KEY,
  restaurant_id text NOT NULL,
  restaurant_name text NOT NULL,
  location text NOT NULL,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users,
  capacity int DEFAULT 6,
  notes text,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (created_by) REFERENCES profiles(id)
);
```

### New Table: slot_members
```sql
CREATE TABLE slot_members (
  id uuid PRIMARY KEY,
  slot_id uuid NOT NULL REFERENCES dining_slots,
  user_id uuid NOT NULL REFERENCES auth.users,
  party_size int DEFAULT 1,
  joined_at timestamp DEFAULT now(),
  UNIQUE(slot_id, user_id)
);
```

### Update: dining_requests Table
```sql
CREATE TABLE dining_requests (
  id uuid PRIMARY KEY,
  from_user_id uuid NOT NULL REFERENCES auth.users,
  to_user_id uuid NOT NULL REFERENCES auth.users,
  slot_id uuid REFERENCES dining_slots,
  status text DEFAULT 'pending', -- pending, accepted, declined
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### Update: profiles Table (if needed)
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating float DEFAULT 5.0;
```

---

## 🏗️ File Structure

### Files to Create:
1. **dashboard.html** (3-4 KB)
   - Restaurant cards with slots
   - Join/Create buttons
   - Mobile responsive

2. **profile-card.html** (1-2 KB)
   - Modal for viewing user profile
   - Request button
   - Phone reveal on request

3. **booking-modal.html** (2-3 KB)
   - Create slot form
   - Join slot form
   - Date/time pickers

4. **dashboard.js** (4-5 KB)
   - Fetch restaurants from Google Places
   - Fetch available slots from Supabase
   - Handle join/create actions
   - Show user profiles in slot

### Files to Update:
1. **redesign.js**
   - Add dashboard navigation
   - Add database functions
   - Handle slot creation/joining

2. **supabase-schema.sql**
   - Add new tables
   - Add RLS policies
   - Add indexes

---

## 🔄 User Flow (Phase 2)

```
Landing Page
    ↓
Google OAuth
    ↓
Profile Setup (name, phone, occupation, photo)
    ↓
Location Search (Delhi, Bangalore, etc)
    ↓
DASHBOARD [PHASE 2 CORE]
├─ Show: Restaurants near location
├─ Show: Available time slots per restaurant
├─ Show: People in each slot (photos, names)
├─ Actions:
│  ├─ Join existing slot
│  ├─ Create new slot
│  └─ View user profile
│
├─ Join Slot Flow:
│  ├─ Show people already in slot
│  ├─ Option to request specific person
│  └─ Confirm join
│
└─ Create Slot Flow:
   ├─ Pick date/time
   ├─ Set party size
   ├─ Add optional notes
   └─ Create & auto-join

User Profile Page [TODO - PHASE 2B]
├─ User info
├─ Booked slots (upcoming)
├─ Pending requests (sent & received)
└─ Request actions (accept/decline)

[PHASE 3 - TOMORROW]
Request System
├─ Send requests to specific people
├─ Accept/decline requests
├─ Real-time notifications
└─ Finalize group booking
```

---

## 🎨 Dashboard Design (from styles-redesign.css)

Uses existing color scheme:
- Primary: #2457c5 (Blue)
- Secondary: #087f8c (Teal)
- Background: White cards on light background
- Shadows: Soft drop shadows for depth

Components:
- Restaurant cards (image, name, rating, distance)
- Slot badges ("6:30 PM • 2 people")
- Join buttons (teal, 48px height)
- User avatars (circular, 40px)
- Modal overlays (dark backdrop)

---

## 💻 Implementation Order

### Hour 1 (Database):
1. Add dining_slots table
2. Add slot_members table  
3. Add dining_requests table
4. Add RLS policies
5. Test Supabase queries

### Hour 2 (Dashboard Page):
1. Create dashboard.html structure
2. Style with existing CSS
3. Add restaurant cards layout
4. Add time slot cards
5. Add mobile responsiveness

### Hour 3 (Backend Logic):
1. Create dashboard.js
2. Implement Google Places search
3. Implement Supabase slot queries
4. Add join/create slot handlers
5. Add error handling & toasts

### Hour 4 (Polish):
1. Create profile card modal
2. Add booking modals
3. Update redesign.js navigation
4. Test full flow end-to-end
5. Bug fixes

---

## 🚀 Success Criteria

✅ User can see restaurants nearby  
✅ User can see available time slots  
✅ User can see who's in each slot  
✅ User can join a slot  
✅ User can create a new slot  
✅ User can view other user profiles  
✅ All modals responsive on mobile  
✅ Supabase queries optimized  
✅ No console errors  
✅ Toast notifications working  

---

## 📱 What Phase 2B Will Add (Tomorrow)

- Request system (send/accept/decline)
- Auto-match notification
- Full user profile page
- Booked slots management
- Pending requests view
- Real-time updates (optional)

---

## ⚠️ Notes

- **Google Places API**: User is setting up during Phase 2 work (add to config.js)
- **Location data**: Uses user-entered location from Phase 1
- **Restaurant data**: Real data from Google Places (not demo)
- **Time slots**: From Supabase database
- **User matching**: Manual (select person) + auto-match option (Phase 2B)

---

**Ready to build? Let's go! 🚀🍽️**
