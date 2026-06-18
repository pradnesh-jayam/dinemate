# DineMate

DineMate is a lightweight web app prototype for finding nearby restaurants and matching with people who are available to dine at the same place and time.

## Features

- Sign up, sign in, or continue in local demo mode
- Browse nearby restaurants with cuisine, area, rating, and distance
- Add your available date and time for a selected restaurant
- See all dining availability in one list
- Find possible matches, with "Best match" shown when another diner overlaps your restaurant and time window
- Optional Supabase authentication and availability storage

## Local Run

```bash
npm start
```

Open:

```text
http://127.0.0.1:5173/
```

## Supabase Setup

1. Create a Supabase project.
2. Run the full contents of `supabase-schema.sql` in the SQL Editor.
3. Add your Supabase project URL and anon key in `config.js`.
4. For easier testing, disable email confirmation in Authentication > Sign In / Providers > Email.

## Main Files

```text
index.html           Sign in and demo mode
choice.html          Main action chooser
dashboard.html       Overview of restaurants, availability, and matches
programs.html        Restaurant discovery
meetings.html        Dining availability list
create-meeting.html  Add availability
join-meeting.html    Quick join restaurant list
speakers.html        Possible matches
app.js               App state, rendering, auth, and matching logic
styles.css           Responsive UI styling
server.js            Local preview server
```
