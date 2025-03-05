-- Update exercises table to support different exercise types
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT NOT NULL DEFAULT 'weight_based',
ADD COLUMN IF NOT EXISTS distance NUMERIC,
ADD COLUMN IF NOT EXISTS distance_unit TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER, -- in seconds
ADD COLUMN IF NOT EXISTS intensity TEXT;

-- Update template_exercises table to support different exercise types
ALTER TABLE public.template_exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT NOT NULL DEFAULT 'weight_based',
ADD COLUMN IF NOT EXISTS distance NUMERIC,
ADD COLUMN IF NOT EXISTS distance_unit TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER, -- in seconds
ADD COLUMN IF NOT EXISTS intensity TEXT;

-- Add exercise types to common_exercises table
ALTER TABLE public.common_exercises 
ADD COLUMN IF NOT EXISTS default_type TEXT NOT NULL DEFAULT 'weight_based';

-- Update habits table to add target_per_day
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS target_per_day INTEGER NOT NULL DEFAULT 1;

-- Update common exercises to add default types
UPDATE public.common_exercises SET default_type = 'cardio_time' 
WHERE name IN ('Jumping Jack', 'Burpee', 'Mountain Climber', 'Battle Ropes');

UPDATE public.common_exercises SET default_type = 'cardio_distance' 
WHERE name IN ('Running', 'Cycling', 'Swimming', 'Rowing');

-- Add more exercise types if not already in the table
INSERT INTO public.common_exercises (name, category, equipment, description, default_type)
SELECT 'Running', 'Cardio', 'None', 'Running on treadmill or outdoors', 'cardio_distance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.common_exercises WHERE name = 'Running'
);

INSERT INTO public.common_exercises (name, category, equipment, description, default_type)
SELECT 'Cycling', 'Cardio', 'Machine', 'Indoor cycling or outdoor cycling', 'cardio_distance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.common_exercises WHERE name = 'Cycling'
);

INSERT INTO public.common_exercises (name, category, equipment, description, default_type)
SELECT 'Swimming', 'Cardio', 'None', 'Swimming in pool or open water', 'cardio_distance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.common_exercises WHERE name = 'Swimming'
);

INSERT INTO public.common_exercises (name, category, equipment, description, default_type)
SELECT 'Rowing', 'Cardio', 'Machine', 'Rowing machine workout', 'cardio_distance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.common_exercises WHERE name = 'Rowing'
);

INSERT INTO public.common_exercises (name, category, equipment, description, default_type)
SELECT 'Jump Rope', 'Cardio', 'Equipment', 'Skipping with jump rope', 'cardio_time'
WHERE NOT EXISTS (
    SELECT 1 FROM public.common_exercises WHERE name = 'Jump Rope'
);

INSERT INTO public.common_exercises (name, category, equipment, description, default_type)
SELECT 'Elliptical', 'Cardio', 'Machine', 'Workout on elliptical machine', 'cardio_time'
WHERE NOT EXISTS (
    SELECT 1 FROM public.common_exercises WHERE name = 'Elliptical'
);

INSERT INTO public.common_exercises (name, category, equipment, description, default_type)
SELECT 'Plank', 'Core', 'Bodyweight', 'Hold body in straight line', 'time_based'
WHERE NOT EXISTS (
    SELECT 1 FROM public.common_exercises WHERE name = 'Plank'
);
