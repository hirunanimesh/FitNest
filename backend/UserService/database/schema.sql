

-- Weight tracking table
CREATE TABLE customer_progress (
  id UUID DEFAULT record_uuid() PRIMARY KEY,
  customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL
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

--feedback
CREATE TABLE feedback (
feedback_id INT PRIMARY KEY,
user_id UUID UNIQUE REFERENCES auth.users(id), -- links to Supabase auth.users
feedback TEXT NOT NULL,
date TIMESTAMP DEFAULT NOW()
);
