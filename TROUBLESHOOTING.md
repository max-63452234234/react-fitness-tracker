# Troubleshooting Guide

## Database Connection Errors

If you see errors like:
```
Error fetching workouts: relation "public.workouts" does not exist
```

**Solution:**
This means your Supabase database tables haven't been set up yet. Follow these steps:

1. Complete the Supabase setup as described in the README.md:
   - Create a Supabase account at [https://supabase.com](https://supabase.com)
   - Create a new project
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-setup.sql` file and run it in the SQL Editor

2. Verify that the tables were created successfully:
   - Check the Table Editor in your Supabase dashboard
   - You should see the following tables:
     - profiles
     - workouts
     - exercises
     - weight_logs
     - macro_logs

3. Make sure your Supabase credentials are correct in `src/index.js`:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
   ```
   Replace these with your actual project URL and anon key from your Supabase project settings.

## Authentication Issues

If you encounter login/registration issues:

1. Make sure email/password authentication is enabled in your Supabase project:
   - Go to Authentication → Providers
   - Ensure Email provider is enabled
   - Set up email templates if necessary

2. Check browser console for specific auth errors
   - Most common: "User not found" or "Invalid login credentials"

3. If using the pre-filled credentials (maximilian.kuchlbauer@gmail.com / IloveJanu1!):
   - You need to actually register this account in your Supabase project first
   - This can be done through the app's registration page

## Routing Issues

If you see 404 errors when navigating or you're redirected to the 404 Page:

1. Make sure you're using the correct base path:
   - In development, the app runs at http://localhost:3001/fitness-tracker
   - All routes should be relative to this path

2. Check your browser URL:
   - If you're seeing URLs like http://localhost:3001/login, you may need to add the base path manually 
   - Try navigating to http://localhost:3001/fitness-tracker/login instead

3. If using GitHub Pages deployment:
   - Ensure you have the correct homepage in package.json:
   ```json
   "homepage": "https://your-username.github.io/fitness-tracker"
   ```

## React Router Issues

If you see warnings from React Router:

```
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7.
```

These are just warnings about future changes in React Router and won't affect functionality. You can safely ignore them for now.

## CORS or API Errors

If you see CORS errors or failures to connect to the Supabase API:

1. Make sure you're using the correct Supabase URL and key
2. Check if your Supabase project has the right CORS configuration:
   - Go to your Supabase project settings
   - Under API, check the API Settings section
   - Make sure the "Additional CORS headers" are set up correctly
   - The localhost URL should be in the allowed origins

## General Troubleshooting

1. Clear your browser cache and reload
2. Check the browser console for specific error messages
3. Make sure all dependencies are installed:
```
cd fitness-tracker
npm install
```
4. Restart the development server:
```
npm start
```

If problems persist, you might need to look at the Supabase logs or check your network tab in browser dev tools for more specific error information.
