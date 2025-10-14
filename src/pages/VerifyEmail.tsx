import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import studyShieldLogo from "@/assets/studyshield-logo.png";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check for auth code or token in URL
        const code = searchParams.get('code');
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (code) {
          // Modern flow: Exchange code for session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError('Email verification failed. Please try again.');
          } else {
            // Success - redirect to email verified page
            navigate('/email-verified');
            return;
          }
        } else if (token && type === 'signup') {
          // Legacy flow: Verify OTP token
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          
          if (verifyError) {
            console.error('Token verification error:', verifyError);
            setError('Email verification failed. Please try again.');
          } else {
            // Success - redirect to email verified page
            navigate('/email-verified');
            return;
          }
        } else {
          // No code, check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email_confirmed_at) {
            navigate('/email-verified');
            return;
          } else {
            setError('Invalid verification link. Please check your email and try again.');
          }
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <img src={studyShieldLogo} alt="StudyShield Logo" className="h-12 mx-auto mb-8" />
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <img src={studyShieldLogo} alt="StudyShield Logo" className="h-12 mx-auto mb-8" />
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmail;