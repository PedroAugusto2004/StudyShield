import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCorrectSiteUrl } from "@/lib/siteUrl";
import studyShieldLogo from "@/assets/studyshield-logo.png";
import PWAInstallPopup from "@/components/PWAInstallPopup";
import { toast } from "@/hooks/use-toast";
import "@/styles/pwa-popup.css";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getTitle = () => {
    if (isForgotPassword) return t('reset.password');
    return isLogin ? t('welcome.back') : t('create.account');
  };

  const getSubtitle = () => {
    if (isForgotPassword) return t('reset.password.description');
    return isLogin ? t('sign.in.description') : t('join.studyshield');
  };

  const getButtonText = () => {
    if (loading) return t('loading');
    if (isForgotPassword) return t('send.reset.email');
    return isLogin ? t('sign.in') : t('create.account');
  };

  // Handle email verification
  const handleEmailVerification = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        setError(t('email.verification.failed'));
        return;
      }
      if (data?.session?.user) {
        // User is verified and logged in, redirect to email verified page
        navigate('/email-verified');
      }
    } catch (error) {
      console.error('Error during email verification:', error);
      setError(t('email.verification.failed'));
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
    
    // Check for reset mode in URL
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setIsForgotPassword(true);
      setIsLogin(false);
    }
    
    // Check if this is an email verification callback
    if (searchParams.get('type') === 'signup') {
      handleEmailVerification();
    }
    
    // Check if this is a Google OAuth callback
    const callback = searchParams.get('callback');
    const code = searchParams.get('code');
    if (callback === 'google' && code) {
      // OAuth callback is being handled by AuthContext
      // Just show loading state
      setLoading(true);
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isForgotPassword) {
        const siteUrl = getCorrectSiteUrl();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/reset-password`
        });
        if (error) throw error;
        setMessage(t('reset.email.sent'));
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          throw new Error(t('passwords.dont.match'));
        }
        const siteUrl = getCorrectSiteUrl();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${siteUrl}/verify-email`,
            data: {
              name: name
            }
          }
        });
        if (error) throw error;
        // Store the name in localStorage and notify app
        localStorage.setItem('userName', name);
        try {
          const event = new CustomEvent('nameUpdated', { detail: { name } });
          window.dispatchEvent(event);
        } catch {}
        setMessage(t('account.created'));
        toast({
          title: "📧 Verification Email Sent!",
          description: "Please check your email to verify your account before signing in.",
        });
      }
    } catch (error: any) {
      setError(error?.message || t('unexpected.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <PWAInstallPopup />
      {/* Auth Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <img src={studyShieldLogo} alt="StudyShield Logo" className="h-12" />
            <div className="w-9" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getTitle()}
          </h1>
          <p className="text-gray-600 text-lg">
            {getSubtitle()}
          </p>
        </div>

        <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  {message}
                </div>
              )}
              <div className="space-y-5">
                {!isLogin && !isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      {t('full.name')}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-12 py-3 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-gray-900"
                        placeholder={t('enter.full.name')}
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    {t('email.address')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 py-3 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-gray-900"
                      placeholder={t('enter.email')}
                      required
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      {t('password')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 py-3 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-gray-900"
                        placeholder={t('enter.password')}
                        required
                      />
                    </div>
                  </div>
                )}

                {!isLogin && !isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                      {t('confirm.password')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 py-3 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-gray-900"
                        placeholder={t('confirm.password.placeholder')}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isForgotPassword && (
                <p className="text-xs text-gray-600 text-center">
                  {t(isLogin ? 'terms.agreement.signin' : 'terms.agreement.signup')}{' '}
                  <a 
                    href="/terms" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {t('terms.and.conditions')}
                  </a>
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getButtonText()}
              </Button>

              {!isForgotPassword && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">{t('or.continue.with')}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const siteUrl = getCorrectSiteUrl();
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: `${siteUrl}/oauth/callback`
                          }
                        });
                        if (error) throw error;
                      } catch (error: any) {
                        setError(error?.message || t('google.signin.failed'));
                        setLoading(false);
                      }
                    }}
                    className="w-full py-3 font-semibold rounded-xl bg-white backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('continue.with.google')}
                  </Button>
                </>
              )}

              {isLogin && !isForgotPassword && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    {t('forgot.password')}
                  </Button>
                </div>
              )}

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    if (isForgotPassword) {
                      setIsForgotPassword(false);
                      setIsLogin(true);
                    } else {
                      setIsLogin(!isLogin);
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {isForgotPassword 
                    ? t('back.to.signin') 
                    : (isLogin 
                      ? t('no.account') 
                      : t('have.account')
                    )
                  }
                </Button>
              </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;