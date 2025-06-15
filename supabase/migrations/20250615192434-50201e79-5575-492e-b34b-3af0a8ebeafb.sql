
-- Create profiles table to store public user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT
);
COMMENT ON TABLE public.profiles IS 'Stores public profile information for users.';

-- Create personas table
CREATE TABLE public.personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_path TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    elevenlabs_api_key TEXT,
    agent_id TEXT,
    conversation_link TEXT,
    avatar_url TEXT
);
COMMENT ON TABLE public.personas IS 'Stores user-created professional personas.';
COMMENT ON COLUMN public.personas.elevenlabs_api_key IS 'Stores the user''s ElevenLabs API key. Will be used by edge functions.';
COMMENT ON COLUMN public.personas.agent_id IS 'Stores the agent ID from ElevenLabs.';
COMMENT ON COLUMN public.personas.conversation_link IS 'Stores the conversation link for the ElevenLabs agent.';
COMMENT ON COLUMN public.personas.avatar_url IS 'Stores the URL for the agent''s avatar from ElevenLabs.';


-- Enable Row Level Security for personas table
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Policies for personas table
CREATE POLICY "Users can view their own personas" ON public.personas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own personas" ON public.personas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own personas" ON public.personas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own personas" ON public.personas FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public personas are visible to everyone" ON public.personas FOR SELECT USING (is_public = TRUE);

-- Enable Row Level Security for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', TRUE) ON CONFLICT (id) DO NOTHING;

-- Policies for resumes storage bucket
CREATE POLICY "Allow authenticated uploads to resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Allow authenticated users to view their own resumes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes' AND owner = auth.uid());
CREATE POLICY "Allow authenticated users to update their own resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes' AND owner = auth.uid());
CREATE POLICY "Allow authenticated users to delete their own resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND owner = auth.uid());
