# Fitness Tracker React App

A comprehensive fitness tracking application built with React that allows users to log workouts, track weight and macros, and visualize their fitness progress over time.

## Features

- User registration and login
- Daily workout logging (exercises, sets, reps)
- Weight and dietary macro tracking
- Progress visualization
- Clean, responsive UI

## Tech Stack

- React (with Hooks and Functional Components)
- React Router for navigation
- Material UI for styling
- Supabase for backend database and authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/fitness-tracker.git
cd fitness-tracker
```

2. Install dependencies
```
npm install
```
or
```
yarn install
```

3. Start the development server
```
npm start
```
or
```
yarn start
```

4. Open your browser and navigate to `http://localhost:3000`

## GitHub Integration Instructions

### Initialize a Git Repository

1. If you haven't already created a .git repository, initialize one:
```
git init
```

2. Add all files to Git:
```
git add .
```

3. Commit your changes:
```
git commit -m "Initial commit"
```

### Push to GitHub

1. Create a new repository on GitHub (don't initialize it with any files)

2. Connect your local repository to GitHub:
```
git remote add origin https://github.com/your-username/fitness-tracker.git
```

3. Push your code to GitHub:
```
git push -u origin main
```
(Note: Use `master` instead of `main` if your default branch is named `master`)

### Deploy using GitHub Pages

1. Install the GitHub Pages package:
```
npm install --save-dev gh-pages
```

2. Add the following scripts to your package.json:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build",
"homepage": "https://your-username.github.io/fitness-tracker"
```

3. Deploy the app:
```
npm run deploy
```

4. Go to your GitHub repository settings, navigate to the Pages section, and ensure the site is being built from the gh-pages branch

## Supabase Setup Instructions

This application uses Supabase as a backend. Follow these steps to set up your Supabase project:

1. Create a free Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project and note your project URL and anon key
3. Navigate to the SQL Editor in your Supabase dashboard
4. Copy the contents of the `supabase-setup.sql` file from this project
5. Paste the SQL into the editor and run the queries to create all required tables:
   - profiles (user information)
   - workouts (workout sessions)
   - exercises (exercises within workouts)
   - weight_logs (weight tracking entries)
   - macro_logs (nutrition tracking entries)
6. Verify that all tables were created successfully by checking the Table Editor
7. Configure Authentication to allow email/password sign-ups

### Update Supabase Credentials

In the `src/index.js` file, update the Supabase configuration with your project details:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

Note: You can find your Supabase URL and anon key in your project settings under API.

### Database Schema

The application relies on the following database structure:

1. **profiles**: Stores user profile information
   - id (references auth.users)
   - full_name, age, gender, height, fitness_goal
   - created_at, updated_at

2. **workouts**: Stores workout sessions
   - id, user_id (references auth.users)
   - date, notes, created_at

3. **exercises**: Stores exercises within workouts
   - id, workout_id (references workouts)
   - name, sets, reps, weight, created_at

4. **weight_logs**: Stores weight entries
   - id, user_id (references auth.users)
   - date, weight, created_at

5. **macro_logs**: Stores nutrition data
   - id, user_id (references auth.users)
   - date, calories, protein, carbs, fat, created_at

## Best Practices

- Keep components focused on a single responsibility
- Use React Hooks for state management
- Follow atomic design principles for UI components
- Implement proper error handling for API calls
- Ensure responsive design for mobile users
