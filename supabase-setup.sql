-- Create profiles table for storing user information (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    age INTEGER,
    gender TEXT,
    height NUMERIC,
    fitness_goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view and update only their own profiles (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can view and update their own profiles'
    ) THEN
        CREATE POLICY "Users can view and update their own profiles"
        ON public.profiles
        FOR ALL
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Create workout tracking table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage only their own workouts (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workouts' AND policyname = 'Users can manage their own workouts'
    ) THEN
        CREATE POLICY "Users can manage their own workouts"
        ON public.workouts
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create exercise tracking table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policy for exercise access (via workout ownership) (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'exercises' AND policyname = 'Users can manage exercises for their workouts'
    ) THEN
        CREATE POLICY "Users can manage exercises for their workouts"
        ON public.exercises
        FOR ALL
        USING (EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = exercises.workout_id
            AND workouts.user_id = auth.uid()
        ))
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = exercises.workout_id
            AND workouts.user_id = auth.uid()
        ));
    END IF;
END
$$;

-- Create weight tracking table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    weight NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for weight log access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'weight_logs' AND policyname = 'Users can manage their own weight logs'
    ) THEN
        CREATE POLICY "Users can manage their own weight logs"
        ON public.weight_logs
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create macro tracking table (nutrition) (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.macro_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    calories INTEGER NOT NULL,
    protein NUMERIC NOT NULL,
    carbs NUMERIC NOT NULL,
    fat NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.macro_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for macro log access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'macro_logs' AND policyname = 'Users can manage their own macro logs'
    ) THEN
        CREATE POLICY "Users can manage their own macro logs"
        ON public.macro_logs
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create workout templates table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for workout template access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workout_templates' AND policyname = 'Users can manage their own workout templates'
    ) THEN
        CREATE POLICY "Users can manage their own workout templates"
        ON public.workout_templates
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create template exercises table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.template_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight NUMERIC,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;

-- Create policy for template exercises access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'template_exercises' AND policyname = 'Users can manage exercises for their templates'
    ) THEN
        CREATE POLICY "Users can manage exercises for their templates"
        ON public.template_exercises
        FOR ALL
        USING (EXISTS (
            SELECT 1 FROM public.workout_templates
            WHERE workout_templates.id = template_exercises.template_id
            AND workout_templates.user_id = auth.uid()
        ))
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.workout_templates
            WHERE workout_templates.id = template_exercises.template_id
            AND workout_templates.user_id = auth.uid()
        ));
    END IF;
END
$$;

-- Create habits table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    tracking_type TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'multiple'
    target_per_day INTEGER DEFAULT 1, -- For multiple tracking type, how many times per day
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Create policy for habit access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'habits' AND policyname = 'Users can manage their own habits'
    ) THEN
        CREATE POLICY "Users can manage their own habits"
        ON public.habits
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create habit logs table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    count INTEGER DEFAULT 1, -- Count of completions for multiple tracking type
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for habit logs access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'habit_logs' AND policyname = 'Users can manage their own habit logs'
    ) THEN
        CREATE POLICY "Users can manage their own habit logs"
        ON public.habit_logs
        FOR ALL
        USING (EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_logs.habit_id
            AND habits.user_id = auth.uid()
        ))
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_logs.habit_id
            AND habits.user_id = auth.uid()
        ));
    END IF;
END
$$;

-- Common exercise reference table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.common_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., "Chest", "Back", "Legs", etc.
    equipment TEXT, -- e.g., "Barbell", "Dumbbell", "Machine", "Bodyweight", etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- This table is read-only for users, but they can select from it
ALTER TABLE public.common_exercises ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view common exercises (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'common_exercises' AND policyname = 'Users can view common exercises'
    ) THEN
        CREATE POLICY "Users can view common exercises"
        ON public.common_exercises
        FOR SELECT
        USING (true);
    END IF;
END
$$;

-- Insert common exercises only if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.common_exercises LIMIT 1) THEN
        INSERT INTO public.common_exercises (name, category, equipment, description) VALUES
        ('Bench Press', 'Chest', 'Barbell', 'Lying on bench, press barbell upward'),
        ('Squat', 'Legs', 'Barbell', 'Barbell on shoulders, bend knees to parallel'),
        ('Deadlift', 'Back', 'Barbell', 'Lift barbell from floor with straight back'),
        ('Pull-up', 'Back', 'Bodyweight', 'Hang from bar, pull body upward'),
        ('Push-up', 'Chest', 'Bodyweight', 'Push body up from prone position'),
        ('Shoulder Press', 'Shoulders', 'Dumbbell', 'Press dumbbells overhead'),
        ('Bicep Curl', 'Arms', 'Dumbbell', 'Curl dumbbells toward shoulders'),
        ('Tricep Extension', 'Arms', 'Dumbbell', 'Extend arms with weight behind head'),
        ('Leg Press', 'Legs', 'Machine', 'Push weight away with legs'),
        ('Lat Pulldown', 'Back', 'Machine', 'Pull bar down toward chest'),
        ('Leg Curl', 'Legs', 'Machine', 'Curl legs against resistance'),
        ('Chest Fly', 'Chest', 'Dumbbell', 'Arc dumbbells in wide motion'),
        ('Lunge', 'Legs', 'Bodyweight', 'Step forward into lunge position'),
        ('Plank', 'Core', 'Bodyweight', 'Hold body in straight line'),
        ('Russian Twist', 'Core', 'Bodyweight', 'Twist torso with feet elevated'),
        ('Mountain Climber', 'Core', 'Bodyweight', 'Alternate knees to chest in plank'),
        ('Burpee', 'Full Body', 'Bodyweight', 'Drop to floor, pushup, jump up'),
        ('Jumping Jack', 'Cardio', 'Bodyweight', 'Jump with arms and legs out and in'),
        ('Kettlebell Swing', 'Full Body', 'Kettlebell', 'Swing kettlebell from between legs to chest height'),
        ('Battle Ropes', 'Full Body', 'Equipment', 'Create waves with heavy ropes');
    END IF;
END
$$;

-- Create meal templates table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.meal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    calories INTEGER NOT NULL,
    protein NUMERIC NOT NULL,
    carbs NUMERIC NOT NULL,
    fat NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for meal template access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meal_templates' AND policyname = 'Users can manage their own meal templates'
    ) THEN
        CREATE POLICY "Users can manage their own meal templates"
        ON public.meal_templates
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create exercise progress table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.exercise_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    exercise_name TEXT NOT NULL,
    date DATE NOT NULL,
    weight NUMERIC,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for exercise progress access (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'exercise_progress' AND policyname = 'Users can manage their own exercise progress'
    ) THEN
        CREATE POLICY "Users can manage their own exercise progress"
        ON public.exercise_progress
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Make sure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
