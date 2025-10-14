-- Create function to safely delete users and their data
CREATE OR REPLACE FUNCTION delete_user_safely(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete user conversations first (due to foreign key)
  DELETE FROM public.conversations WHERE user_id = delete_user_safely.user_id;
  
  -- Delete user profile
  DELETE FROM public.user_profiles WHERE id = delete_user_safely.user_id;
  
  -- Delete from auth.users (this will cascade if properly configured)
  DELETE FROM auth.users WHERE id = delete_user_safely.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;