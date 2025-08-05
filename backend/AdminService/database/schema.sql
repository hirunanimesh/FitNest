CREATE TABLE admin(
  admin_id SERIAL PRIMARY KEY, -- app-specific ID
  user_id UUID UNIQUE REFERENCES auth.users(id), -- links to Supabase auth.users
  Field
);
