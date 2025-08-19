-- Initial schema migration for FitNest application

-- Create custom types
CREATE TYPE duration_type AS ENUM ('1 day', '1 month', '1 year');

-- Customer table (extends Supabase auth.users)
CREATE TABLE customer (
  customer_id SERIAL PRIMARY KEY, -- app-specific ID
  user_id UUID UNIQUE REFERENCES auth.users(id), -- links to Supabase auth.users
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  address TEXT,
  contact_number VARCHAR(15),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Weight tracking table
CREATE TABLE customer_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calendar table for storing user tasks
CREATE TABLE calendar (
  calendar_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_date DATE NOT NULL,
  task TEXT NOT NULL,
  customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
  note TEXT,
  google_event_id TEXT, -- stores the event ID from Google Calendar
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
  feedback_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- links to Supabase auth.users
  feedback TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW()
);

-- Trainer table (extends Supabase auth.users)
CREATE TABLE trainer (
  trainer_id SERIAL PRIMARY KEY, -- app-specific ID
  trainer_name VARCHAR(50) NOT NULL,
  rating INT,
  contact_number VARCHAR(15),
  profile_image_url TEXT,
  experience INT,
  skills TEXT[], -- array of skills
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trainer sessions table
CREATE TABLE trainer_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id INT REFERENCES trainer(trainer_id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  title TEXT NOT NULL,
  duration duration_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  product_id_stripe TEXT,
  price_id_stripe TEXT,
  zoom_link TEXT, -- link to Zoom session
  booked BOOLEAN DEFAULT FALSE -- whether the session is booked
);

-- Trainer booking table
CREATE TABLE trainer_booking (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES trainer_sessions(session_id) ON DELETE CASCADE,
  customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
  booking_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'confirmed'
);

-- Gym table
CREATE TABLE gym (
  gym_id SERIAL PRIMARY KEY,
  address VARCHAR(255),
  location VARCHAR(255),
  contact_no VARCHAR(20),
  gym_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gym plans table
CREATE TABLE gym_plans (
  plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id INT REFERENCES gym(gym_id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  title TEXT NOT NULL,
  duration duration_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  product_id_stripe TEXT,
  price_id_stripe TEXT
);

-- Subscription table
CREATE TABLE subscription (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id INTEGER REFERENCES customer(customer_id) ON DELETE CASCADE,
  plan_id UUID REFERENCES gym_plans(plan_id) ON DELETE CASCADE,
  subscription_date DATE NOT NULL,
  status VARCHAR(10) CHECK (status IN ('active', 'deact')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customer_user_id ON customer(user_id);
CREATE INDEX idx_calendar_customer_date ON calendar(customer_id, task_date);
CREATE INDEX idx_calendar_date ON calendar(task_date);
CREATE INDEX idx_trainer_sessions_trainer_id ON trainer_sessions(trainer_id);
CREATE INDEX idx_trainer_sessions_date ON trainer_sessions(date);
CREATE INDEX idx_subscription_customer_id ON subscription(customer_id);
CREATE INDEX idx_subscription_plan_id ON subscription(plan_id);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_customer_updated_at 
    BEFORE UPDATE ON customer 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_updated_at 
    BEFORE UPDATE ON calendar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainer_updated_at 
    BEFORE UPDATE ON trainer 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_updated_at 
    BEFORE UPDATE ON gym 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on tables
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (customize as needed)
-- Customer policies
CREATE POLICY "Users can view own customer profile" ON customer
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer profile" ON customer
    FOR UPDATE USING (auth.uid() = user_id);

-- Customer progress policies
CREATE POLICY "Users can view own progress" ON customer_progress
    FOR SELECT USING (
        customer_id IN (
            SELECT customer_id FROM customer WHERE user_id = auth.uid()
        )
    );

-- Calendar policies
CREATE POLICY "Users can manage own calendar" ON calendar
    FOR ALL USING (
        customer_id IN (
            SELECT customer_id FROM customer WHERE user_id = auth.uid()
        )
    );

-- Public read access for gym and trainer information
CREATE POLICY "Anyone can view gyms" ON gym FOR SELECT USING (true);
CREATE POLICY "Anyone can view gym plans" ON gym_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can view trainers" ON trainer FOR SELECT USING (true);
CREATE POLICY "Anyone can view trainer sessions" ON trainer_sessions FOR SELECT USING (true);