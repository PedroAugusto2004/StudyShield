-- Add language preference to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT NULL CHECK (language IN ('en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'));

-- Create index for language column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_language ON user_profiles(language);

-- Update existing users with NULL language to have no default (let the app handle browser detection)
-- This ensures existing users get their browser language detected on next login