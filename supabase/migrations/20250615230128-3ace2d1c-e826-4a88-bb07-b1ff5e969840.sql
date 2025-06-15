
-- Add columns to profiles table to store ElevenLabs agent information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS elevenlabs_agent_id TEXT,
ADD COLUMN IF NOT EXISTS elevenlabs_agent_link TEXT;

-- Update personas table to ensure it has the agent fields (some may already exist)
ALTER TABLE public.personas 
ADD COLUMN IF NOT EXISTS elevenlabs_agent_id TEXT,
ADD COLUMN IF NOT EXISTS elevenlabs_agent_link TEXT;

-- Update the personas table to rename agent_id to elevenlabs_agent_id for clarity if needed
-- Note: Only run this if you want to rename the existing agent_id column
-- ALTER TABLE public.personas RENAME COLUMN agent_id TO elevenlabs_agent_id;
