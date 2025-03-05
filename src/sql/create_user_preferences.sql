-- Create user_preferences table for theme and text size preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme_mode TEXT NOT NULL DEFAULT 'light',
  text_size TEXT NOT NULL DEFAULT 'medium', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Make sure each user can only have one preferences record
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Create RLS policies for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Read - Users can only read their own preferences
CREATE POLICY "Users can read their own preferences" 
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Insert - Users can only create preferences for themselves
CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update - Users can only update their own preferences
CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to user_preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add trigger function if it doesn't exist (in case this is run in a new database)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
    CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Grant necessary permissions to users
GRANT ALL ON public.user_preferences TO service_role;
GRANT ALL ON public.user_preferences TO authenticated;
