# Fitness Tracker

A comprehensive fitness tracking application with Supabase integration.

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
