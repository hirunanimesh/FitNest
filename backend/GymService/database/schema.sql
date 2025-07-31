CREATE TABLE Gym (
  gym_id INT,
  address VARCHAR(255),
  location VARCHAR(255),
  contact_no VARCHAR(20),
  gym_name VARCHAR(100)
);

---------------------------------------------------------------------------

CREATE TYPE duration_type AS ENUM ('1 day', '1 month', '1 year');

CREATE TABLE "Gym_plans" (
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
