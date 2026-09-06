# DineMate 🍽️

DineMate is a social dining app I built to make it easier to find restaurants, join dining plans, and meet people who are interested in dining at the same place.

Users can discover restaurants, create or join dining slots, connect with other users, and chat in real time.

## What you can do

* Sign in with Google
* Find restaurants by location, cuisine, ratings, and search
* Create and join dining slots
* Add friends and follow other users
* Chat with people in a dining slot
* Get real-time notifications
* Track activity and unlock badges
* View restaurant locations on a map

## Tech Stack

* **Frontend:** JavaScript, TypeScript, HTML, CSS, Vite
* **Authentication:** Firebase Authentication
* **Database:** Cloud Firestore
* **Maps:** Leaflet + OpenStreetMap(currently in devlopment)
* **Testing:** Vitest
* **Deployment:** Netlify

## A few things I worked on

One of the main parts of the project was making the chat and notifications update in real time using Firestore listeners instead of repeatedly polling the database.

I also wrote Firestore Security Rules to make sure users can only access data they're actually allowed to access, such as restricting private chat access to participants.

For search, I built a small client-side search index to make searching through users, restaurants, and available slots faster.

The project is split into separate feature modules such as `chat`, `restaurants`, `slots`, `friends`, `notifications`, `search`, and `profiles`.

## Run locally

```bash
git clone https://github.com/pradnesh-jayam/dinemate.git
cd dinemate
npm install
```

Create a `.env.local` file with the required Firebase configuration and run:

```bash
npm run dev
```

## Live Demo

https://dinemate07.netlify.app/
 
