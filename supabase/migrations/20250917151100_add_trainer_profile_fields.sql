-- Add missing fields to trainer table for profile management
ALTER TABLE trainer
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN email VARCHAR(255);

-- Create index for user_id
CREATE INDEX idx_trainer_user_id ON trainer(user_id);

-- Update RLS policies for trainer table
DROP POLICY IF EXISTS "Anyone can view trainers" ON trainer;
CREATE POLICY "Anyone can view trainers" ON trainer FOR SELECT USING (true);
CREATE POLICY "Trainers can update own profile" ON trainer
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Trainers can insert own profile" ON trainer
    FOR INSERT WITH CHECK (auth.uid() = user_id);