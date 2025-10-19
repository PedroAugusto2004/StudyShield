-- Add is_shared column to conversations table
ALTER TABLE conversations ADD COLUMN is_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN share_id TEXT UNIQUE;

-- Create index for share_id lookups
CREATE INDEX idx_conversations_share_id ON conversations(share_id) WHERE share_id IS NOT NULL;

-- Create policy to allow viewing shared conversations for authenticated users
CREATE POLICY "Authenticated users can view shared conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = user_id OR (is_shared = TRUE AND auth.uid() IS NOT NULL)
  );

-- Update existing policy to include shared conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = user_id OR (is_shared = TRUE AND auth.uid() IS NOT NULL)
  );
