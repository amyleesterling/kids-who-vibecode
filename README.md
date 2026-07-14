# Vibe Code Club

A playful, parent-supervised community for young creative coders. Every week brings a new open-ended challenge; kids can build with any tool, submit through a grown-up, explore approved projects, and vote for one favorite.

## What is included

- A responsive weekly challenge landing page
- Project gallery with one favorite vote per anonymous Firebase account/device
- Parent-supervised submission form with a moderation queue
- Kid-safety defaults: nicknames, age bands, no comments or direct messages
- Firebase Auth + Firestore integration with security rules
- Local demo mode when Firebase is not configured

## Run locally

```bash
npm install
npm run dev
```

The app uses demo projects and local storage until Firebase variables are supplied.

## Connect Firebase

1. Create a Firebase web app and enable **Firestore** and **Anonymous Authentication**.
2. Copy `.env.example` to `.env.local` and fill in the six `VITE_FIREBASE_*` values.
3. Deploy the included rules and indexes with `firebase deploy --only firestore`.
4. Add an active document to `challenges` and approved documents to `projects`. If these collections are empty, the designed sample content remains visible.

Submissions arrive in the private `submissions` collection with `status: pending`. Public gallery entries belong in `projects` with `status: approved`; parent names and emails should never be copied there.

## Build

```bash
npm run lint
npm run build
```

The `firebase.json` file is ready to host the production `dist` folder after a build.
