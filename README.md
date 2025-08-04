# GymLog

GymLog is a workout tracking web application built with Next.js and Firebase. It lets users sign in with Google, log sets quickly using an intuitive interface, and see how their strength progresses over time through simple charts and history.

## Screenshot




## Features

1. Google sign in for fast onboarding  
2. Secure per user workout storage in Firestore with scoped access  
3. Quick logging of sets using exercise selector and weight/reps controls  
4. Real time line charts that show weight over time for each exercise  
5. Workout history with filtering by exercise and date range  
6. Personal record and total volume insights to help users understand progress  
7. Responsive interface built with Tailwind CSS  
8. Firestore composite indexing for efficient queries  
9. Enforced access rules so users only see their own data

## Technology stack

- Frontend: Next.js (App Router), React, Tailwind CSS  
- Authentication and storage: Firebase Auth with Google and Firestore  
- Visualization: Chart.js via react-chartjs-2  
- Deployment: Vercel  

## Getting started

1. Clone this repository  
   ```bash
   git clone https://github.com/TobyKThurston/gymlog.git
   cd gymlog
