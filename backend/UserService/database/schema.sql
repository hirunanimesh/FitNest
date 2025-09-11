-- Users table (extends Supabase auth.users)
CREATE TABLE public.customer (
  id serial not null,
  user_id uuid null,
  first_name character varying(50) not null,
  last_name character varying(50) not null,
  address text null,
  phone_no character varying(15) null,
  birthday date null,
  gender character varying(10) null,
  profile_img text null,
  created_at timestamp without time zone null default now(),
  location json null,
  "calendarId" integer null,
  constraint customer_pkey primary key (id),
  constraint customer_id_key unique (id),
  constraint customer_user_id_key unique (user_id),
  constraint customer_gender_check check (
    (
      (gender)::text = any (
        (
          array[
            'male'::character varying,
            'female'::character varying,
            'other'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- Weight tracking table
CREATE TABLE customer_progress (
  id UUID DEFAULT record_uuid() PRIMARY KEY,
  customer_id INT REFERENCES customer(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL
);

-- Create calendar table for storing user tasks
CREATE TABLE calendar (
  calendar_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_date DATE NOT NULL,
  task TEXT NOT NULL,
  customer_id INT REFERENCES customer(id) ON DELETE CASCADE,
  note TEXT,
  google_event_id TEXT, -- stores the event ID from Google Calendar
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_calendar_customer_date ON calendar(customer_id, task_date);
CREATE INDEX idx_calendar_date ON calendar(task_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calendar_updated_at 
    BEFORE UPDATE ON calendar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Table to store Google OAuth tokens per user (used by UserService)
CREATE TABLE IF NOT EXISTS user_google_tokens (
  user_id TEXT PRIMARY KEY,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  scope TEXT,
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
