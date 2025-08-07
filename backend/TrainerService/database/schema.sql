-- Trainer table (extends Supabase auth.users)
CREATE TABLE trainer(
  trainer_id SERIAL PRIMARY KEY, -- app-specific ID
  trainer_name VARCHAR(50) NOT NULL,
  rating INT,
  contact_number VARCHAR(15),
  profile_image_url TEXT,
  experience INT,
  skills TEXT[], -- array of skills
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE "trainer_sessions" (
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
  booked BOOLEAN DEFAULT FALSE, -- whether the session is booked
);

CREATE TABLE "trainer_booking" (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id INTEGER NOT NULL,
  session_id UUID NOT NULL,
  status VARCHAR(10) CHECK (status IN ('active', 'deact')) NOT NULL
);

