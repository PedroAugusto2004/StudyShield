import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [exchanged, setExchanged] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (code && !exchanged) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('OAuth callback error:', error);
            navigate('/auth?error=oauth_failed');
            return;
          }
          setExchanged(true);
        } catch (error) {
          console.error('OAuth callback error:', error);
          navigate('/auth?error=oauth_failed');
        }
      } else if (!code) {
        navigate('/auth');
      }
    };

    handleCallback();
  }, [searchParams, navigate, exchanged]);

  useEffect(() => {
    if (exchanged && !loading && user) {
      navigate('/chat', { replace: true });
    }
  }, [exchanged, loading, user, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;