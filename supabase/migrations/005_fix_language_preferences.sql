-- Fix language preferences for existing users
-- This migration ensures that users without a language preference get their browser language detected

-- First, let's make sure the language column exists and has the right constraints
ALTER TABLE user_profiles 
ALTER COLUMN language DROP DEFAULT;

-- Update the check constraint to be more explicit
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_language_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_language_check 
CHECK (language IS NULL OR language IN ('en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'));

-- Set any invalid language values to NULL so they get re-detected
UPDATE user_profiles 
SET language = NULL 
WHERE language IS NOT NULL 
AND language NOT IN ('en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko');

-- Create or replace the index
DROP INDEX IF EXISTS idx_user_profiles_language;
CREATE INDEX idx_user_profiles_language ON user_profiles(language) WHERE language IS NOT NULL;