-- Trainer table (extends Supabase auth.users)
CREATE TABLE trainer(
  trainer_id SERIAL PRIMARY KEY, -- app-specific ID
  user_id UUID UNIQUE REFERENCES auth.users(id), -- links to Supabase auth.users
  trainer_name VARCHAR(50) NOT NULL,
  rating INT,
  contact_number VARCHAR(15),
  profile_image_url TEXT,
  experience INT,
  skills TEXT[], -- array of skills
  verified BOOLEAN DEFAULT FALSE
);

-- Trainer_plans table
CREATE TABLE trainer_plans (
  id UUID DEFAULT plan_uuid() PRIMARY KEY,
  trainer_id INT REFERENCES trainer(trainer_id) ON DELETE CASCADE,
  title TEXT,
  category TEXT,
  description TEXT,
  image_url TEXT,
  instruction_pdf TEXT, -- URL to PDF with instructions
  type TEXT CHECK (type IN ('weight_loss', 'muscle_gain', 'endurance', 'flexibility'))
);

-- session
CREATE TABLE session (
 id UUID DEFAULT session_uuid() PRIMARY KEY,
  trainer_id INT REFERENCES trainer(trainer_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INT -- in hours
  zoom_link TEXT, -- link to Zoom session
  title TEXT, -- title of the session
  description TEXT,
  booked BOOLEAN DEFAULT FALSE, -- whether the session is booked
);

