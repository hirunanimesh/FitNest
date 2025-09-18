-- Add verifications table for gym and trainer verification requests
CREATE TABLE verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id VARCHAR(255),
  trainer_id VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_gym_or_trainer CHECK (
    (gym_id IS NOT NULL AND trainer_id IS NULL) OR
    (trainer_id IS NOT NULL AND gym_id IS NULL)
  )
);

-- Create index for faster lookups
CREATE INDEX idx_verifications_gym_id ON verifications(gym_id);
CREATE INDEX idx_verifications_trainer_id ON verifications(trainer_id);
CREATE INDEX idx_verifications_status ON verifications(status);

-- Enable RLS
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Gyms can view own verification requests" ON verifications
    FOR SELECT USING (auth.uid()::text = gym_id);

CREATE POLICY "Gyms can insert own verification requests" ON verifications
    FOR INSERT WITH CHECK (auth.uid()::text = gym_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_verifications_updated_at
    BEFORE UPDATE ON verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();