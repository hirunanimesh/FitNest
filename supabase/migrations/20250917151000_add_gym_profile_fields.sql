-- Add missing fields to gym table for profile management
ALTER TABLE gym
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN verified BOOLEAN DEFAULT FALSE,
ADD COLUMN profile_img TEXT,
ADD COLUMN description TEXT,
ADD COLUMN operating_Hours VARCHAR(255),
ADD COLUMN documents JSONB DEFAULT '[]'::jsonb;

-- Create index for user_id
CREATE INDEX idx_gym_user_id ON gym(user_id);

-- Update RLS policies for gym table
DROP POLICY IF EXISTS "Anyone can view gyms" ON gym;
CREATE POLICY "Anyone can view gyms" ON gym FOR SELECT USING (true);
CREATE POLICY "Gyms can update own profile" ON gym
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Gyms can insert own profile" ON gym
    FOR INSERT WITH CHECK (auth.uid() = user_id);