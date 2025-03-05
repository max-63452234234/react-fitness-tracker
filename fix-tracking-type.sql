-- Fix for missing tracking_type column in habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS tracking_type TEXT NOT NULL DEFAULT 'daily';

-- Ensure target_per_day column exists
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS target_per_day INTEGER NOT NULL DEFAULT 1;

-- Add missing columns to habit_logs if needed
ALTER TABLE public.habit_logs
ADD COLUMN IF NOT EXISTS count INTEGER NOT NULL DEFAULT 1;

-- Fix database indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
