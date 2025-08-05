-- Users table (extends Supabase auth.users)
CREATE TABLE customer(
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
CREATE TABLE progress (
  id UUID DEFAULT record_uuid() PRIMARY KEY,
  customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  logged_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- calendar
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

--feedback
CREATE TABLE feedback (
feedback_id INT PRIMARY KEY,
user_id UUID UNIQUE REFERENCES auth.users(id), -- links to Supabase auth.users
feedback TEXT NOT NULL,
date TIMESTAMP DEFAULT NOW()
);



