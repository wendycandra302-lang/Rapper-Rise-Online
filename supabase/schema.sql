-- 1. Create artists table
CREATE TABLE artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  region TEXT NOT NULL,
  budget INTEGER NOT NULL,
  money INTEGER NOT NULL,
  dob TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  pop_asia INTEGER DEFAULT 0,
  pop_europe INTEGER DEFAULT 0,
  pop_america INTEGER DEFAULT 0,
  pop_africa INTEGER DEFAULT 0,
  hype INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Setup Row Level Security (RLS)
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Select policy: User can read their own artist
CREATE POLICY "Users can view their own artist" 
ON artists FOR SELECT 
USING (auth.uid() = user_id);

-- Insert policy: User can insert an artist for themselves
CREATE POLICY "Users can create their own artist" 
ON artists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update policy: User can update their own artist
CREATE POLICY "Users can update their own artist" 
ON artists FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Set up Storage bucket for artist images
INSERT INTO storage.buckets (id, name, public) VALUES ('artists_images', 'artists_images', true);

CREATE POLICY "Anyone can view artist images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artists_images');

CREATE POLICY "Users can upload their artist image"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artists_images' AND auth.uid()::text = (storage.foldername(name))[1]);
