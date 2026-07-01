## Welcome to the Flashcardz NX monorepo
<img width="220" height="210" alt="gif" src="https://github.com/user-attachments/assets/a33b7386-1fda-4c31-a1cb-24e6cdc1b066" />

An interactive, flashcard based learning experience for exam and job interview preparation. 

## Stack:

We’re aiming to build this as a native mobile application using Expo, which we’ll hook up to a native supabase backend. Supabase covers everything we need to ensure a secure, fast mobile app backend. In the frontend, we’ll use SQLite on the mobile itself to ensure a **local first** approach. 

Frontend Client: React Native (Expo) 

API: Supabase PostgREST

Remote Database: Supabase Postgresql

Local DB: SQLite

AI API: https://replicate.com/

## Product Requirements

- As a user, I can create a topic deck, so that I can add flashcards to my game
- As a user, I can add my own flashcard question and answers, so that I can play flashcardz
- As a user, I can purchase “flashcard packs” which are in app purchases for common knowledge points, so that I can learn with minimal setup time.
- As a user, I can toggle “Interview Mode” which allows for me to speak my answer in plain language, and receive feedback on my answer.
- As a user, I can see my stats per topic deck, so that I can track my progression

## Technical Requirements

- user made decks should be kept on-device, never saved to the cloud. This reduces complexity and unnecessary load on db. We’ll use a “sync to other devices” feature in V2 so users can share decks across their own devices but this isn’t in scope for MVP.
- user should be able to use flashcardz completely offline. Their scores and history should sync when back online.
- Each deck should track “games” which holds: DateTime, Score, Answer Ratio
- Each flashcard should have a “notes” attached to it, for the user to fill out when answering or revising.
- Interview mode must allow for natural language input, and generated text output. Use https://replicate.com/
- LLM interview mode needs to be scalable, with as least cost possible
- Offline-first/local-first development from the outset
