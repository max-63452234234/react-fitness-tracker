# Fitness Tracker

A comprehensive fitness tracking application with Supabase integration.

## GitHub Repository

This project is hosted on GitHub at: [https://github.com/max-63452234234/react-fitness-tracker](https://github.com/max-63452234234/react-fitness-tracker)

To clone the repository:
```
git clone https://github.com/max-63452234234/react-fitness-tracker.git
cd react-fitness-tracker
npm install
```

## Features

- Workout tracking and templates
- Habit tracking with daily, weekly, monthly, and yearly views
- Weight and macro tracking
- Exercise progress visualization
- User authentication via Supabase

## Technologies

- React
- Material UI
- Chart.js
- Supabase for backend services
- React Router for navigation

## Deployment with Netlify

This project is configured for easy deployment on Netlify directly from GitHub.

### Setup Instructions

1. Push your repository to GitHub:
   ```
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push
   ```

2. Sign up or log in to [Netlify](https://www.netlify.com/)

3. From the Netlify dashboard, click "New site from Git"

4. Choose "GitHub" as your Git provider and authenticate

5. Select your repository from the list

6. Configure the deployment settings:
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `build`
   - Advanced settings: No need to change, the netlify.toml file handles this

7. Click "Deploy site"

8. Wait for the build to complete and Netlify will provide you with a unique URL

### Continuous Deployment

Once set up, any changes pushed to your GitHub repository will automatically trigger a new build and deployment on Netlify.

### Custom Domain

To use a custom domain:
1. Go to the "Domain settings" section in your Netlify site dashboard
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Configuration

Ensure your Supabase credentials are correctly set up in your environment.

## Database Setup and Maintenance

This application requires a specific database schema in Supabase. Follow these steps for initial setup or to fix database issues:

1. Initial Setup:
   Run the main SQL setup script in your Supabase SQL Editor:
   ```sql
   -- Run the contents of supabase-setup.sql
   ```

2. Apply Schema Updates:
   If needed, apply additional schema updates:
   ```sql
   -- Run the contents of update-schema.sql
   -- Run the contents of update-exercises-schema.sql
   ```

3. Fix Database Issues:
   If you encounter database errors (especially with habit tracking), apply the fix script:
   ```sql
   -- Run the contents of fix-tracking-type.sql
   ```

Common database errors and solutions:

- **"tracking_type column of habits table not found"**: This means the habits table is missing required columns. Run the fix-tracking-type.sql script in the Supabase SQL Editor.
- **"Failed to save habit"**: This could indicate missing columns or indexes. Apply the fix-tracking-type.sql script.
- **"null value in column 'sets' of relation 'exercises' violates not-null constraint"**: This occurs when adding non-weight exercises. The application now includes default values for these fields.

### Recent Fixes

1. **Multiple Habit Tracking**: Fixed the UI and database handling for tracking habits multiple times per day
   - Habits can now be configured with a "Multiple Times Per Day" tracking method
   - Each completion is visually represented with checkmarks
   - Progress indicators show completion against daily targets

2. **Exercise Addition Error Fixed**: Resolved the issue with adding time-based or cardio exercises
   - Added default values for required fields to prevent database constraint violations
   - All exercise types can now be added without errors

After applying database changes, restart your application to ensure the changes take effect.
