import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { userDataService } from "@/services/userDataService";
import PhotoCropper from "@/components/PhotoCropper";
import CookieSettings from "@/components/CookieSettings";
import "./SettingsModal.css";
import { 
  X, 
  User, 
  Shield, 
  Palette, 
  Bell,
  Settings as SettingsIcon,
  Lock,
  LogOut,
  Check,
  Trash2,
  ChevronDown
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

// Sanitize user input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};

// Sanitize error messages to prevent information leakage
const sanitizeError = (error: any, fallbackMessage: string): string => {
  if (typeof error?.message === 'string') {
    const allowedErrors = ['password.incorrect', 'password.mismatch', 'password.length', 'password.required'];
    if (allowedErrors.some(allowed => error.message.includes(allowed))) {
      return error.message;
    }
  }
  return fallbackMessage;
};

const SettingsModal = ({ isOpen, onClose, initialTab = 'general' }: SettingsModalProps) => {
  const { theme, actualTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [profile, setProfile] = useState({
    name: sanitizeInput(localStorage.getItem('userName') || t('user.default')),
    photo: localStorage.getItem('userPhoto') || null
  });
  
  const [formState, setFormState] = useState({
    tempName: sanitizeInput(localStorage.getItem('userName') || t('user.default')),
    nameChanged: false,
    goals: sanitizeInput(localStorage.getItem('userGoals') || ''),
    tempGoals: sanitizeInput(localStorage.getItem('userGoals') || ''),
    goalsChanged: false
  });
  
  const [uiState, setUiState] = useState({
    showCropper: false,
    showDeleteConfirm: false,
    showLogoutConfirm: false,
    showLogoutAllConfirm: false,
    showPasswordChange: false
  });
  
  const [passwordState, setPasswordState] = useState({
    current: '',
    new: '',
    confirm: '',
    loading: false
  });
  
  const [deleteState, setDeleteState] = useState({
    password: '',
    loading: false
  });
  
  const [settings, setSettings] = useState({ notifications: true });
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [dropdownStates, setDropdownStates] = useState({ theme: false, language: false });

  const handleProfileChange = async (field: string, value: string) => {
    try {
      const sanitizedValue = field === 'photo' ? value : sanitizeInput(value);
      setProfile(prev => ({ ...prev, [field]: sanitizedValue }));
      
      if (field === 'photo') {
        localStorage.setItem('userPhoto', sanitizedValue);
        
        if (user?.id) {
          await userDataService.updateUserProfile(user.id, { photo: sanitizedValue });
        }
      }
    } catch (error) {
      toast({ title: t('error'), description: t('profile.update.failed'), variant: "destructive" });
    }
  };

  const handleNameChange = (value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormState(prev => ({
      ...prev,
      tempName: sanitizedValue,
      nameChanged: sanitizedValue !== profile.name
    }));
  };

  const confirmNameChange = async () => {
    try {
      const sanitizedName = sanitizeInput(formState.tempName);
      setProfile(prev => ({ ...prev, name: sanitizedName }));
      localStorage.setItem('userName', sanitizedName);
      
      if (user?.id) {
        await userDataService.updateUserProfile(user.id, { name: sanitizedName });
      }
      
      setFormState(prev => ({ ...prev, nameChanged: false }));
      toast({
        title: t('name.updated'),
        description: t('name.updated.description'),
      });
      window.dispatchEvent(new CustomEvent('nameUpdated', { detail: { name: sanitizedName } }));
      
      // Update Gemini Nano personalization
      window.dispatchEvent(new CustomEvent('personalizationUpdated'));
    } catch (error) {
      toast({ title: t('error'), description: t('name.update.failed'), variant: "destructive" });
    }
  };

  const handleGoalsChange = (value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormState(prev => ({
      ...prev,
      tempGoals: sanitizedValue,
      goalsChanged: sanitizedValue !== prev.goals
    }));
  };

  const confirmGoalsChange = async () => {
    try {
      const sanitizedGoals = sanitizeInput(formState.tempGoals);
      setFormState(prev => ({ ...prev, goals: sanitizedGoals, goalsChanged: false }));
      localStorage.setItem('userGoals', sanitizedGoals);
      
      if (user?.id) {
        await userDataService.updateUserProfile(user.id, { goals: sanitizedGoals });
      }
      
      // Update Gemini Nano personalization
      window.dispatchEvent(new CustomEvent('personalizationUpdated'));
      
      toast({
        title: t('personalization.added'),
        description: t('personalization.added.description'),
      });
    } catch (error) {
      toast({ title: t('error'), description: t('goals.update.failed'), variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    if (!uiState.showLogoutConfirm) {
      setUiState(prev => ({ ...prev, showLogoutAllConfirm: false, showLogoutConfirm: true }));
      return;
    }
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      toast({ title: t('error'), description: t('logout.failed'), variant: "destructive" });
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!uiState.showLogoutAllConfirm) {
      setUiState(prev => ({ ...prev, showLogoutConfirm: false, showLogoutAllConfirm: true }));
      return;
    }
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/';
    } catch (error) {
      toast({ title: t('error'), description: t('logout.failed'), variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (!uiState.showPasswordChange) {
      setUiState(prev => ({ ...prev, showPasswordChange: true }));
      return;
    }

    if (passwordState.new !== passwordState.confirm) {
      toast({ title: t('error'), description: t('password.mismatch'), variant: "destructive" });
      return;
    }

    if (passwordState.new.length < 6) {
      toast({ title: t('error'), description: t('password.length'), variant: "destructive" });
      return;
    }

    setPasswordState(prev => ({ ...prev, loading: true }));
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordState.current
      });
      
      if (signInError) {
        throw new Error(t('password.incorrect'));
      }

      const { error } = await supabase.auth.updateUser({ password: passwordState.new });
      if (error) {
        throw new Error(t('password.update.failed'));
      }
      
      toast({ title: t('password.updated'), description: t('password.updated.description') });
      
      setUiState(prev => ({ ...prev, showPasswordChange: false }));
      setPasswordState({ current: '', new: '', confirm: '', loading: false });
    } catch (error: any) {
      const errorMessage = sanitizeError(error, t('password.update.failed'));
      toast({ title: t('error'), description: errorMessage, variant: "destructive" });
    } finally {
      setPasswordState(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelPasswordChange = () => {
    setUiState(prev => ({ ...prev, showPasswordChange: false }));
    setPasswordState({ current: '', new: '', confirm: '', loading: false });
  };

  const isGoogleUser = user?.app_metadata?.provider === 'google';

  const handleDeleteAccount = async () => {
    if (!uiState.showDeleteConfirm) {
      setUiState(prev => ({ ...prev, showDeleteConfirm: true }));
      return;
    }

    // For non-Google users, require password verification
    if (!isGoogleUser && !deleteState.password.trim()) {
      toast({ title: t('error'), description: t('password.required'), variant: "destructive" });
      return;
    }
    
    setDeleteState(prev => ({ ...prev, loading: true }));
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Only verify password for non-Google users
      if (!isGoogleUser) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: deleteState.password
        });
        
        if (signInError) {
          throw new Error(t('password.incorrect'));
        }
      }

      const { error: deleteUserError } = await supabase.rpc('delete_user');
      if (deleteUserError) {
        throw new Error(t('account.delete.failed'));
      }

      localStorage.clear();
      sessionStorage.clear();
      
      toast({ title: t('account.deleted'), description: t('account.deleted.description') });
      
      await supabase.auth.signOut();
      window.location.href = '/';
      
    } catch (error: any) {
      const errorMessage = sanitizeError(error, t('account.delete.failed'));
      toast({ title: t('error'), description: errorMessage, variant: "destructive" });
    } finally {
      setDeleteState(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempImage(result);
        setUiState(prev => ({ ...prev, showCropper: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    handleProfileChange('photo', croppedImage);
    setUiState(prev => ({ ...prev, showCropper: false }));
    setTempImage(null);
  };

  const handleCropCancel = () => {
    setUiState(prev => ({ ...prev, showCropper: false }));
    setTempImage(null);
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.relative')) {
        setDropdownStates({ theme: false, language: false });
      }
      setUiState(prev => ({ ...prev, showLogoutConfirm: false, showLogoutAllConfirm: false }));
    };

    const handleProfileLoaded = () => {
      const name = sanitizeInput(localStorage.getItem('userName') || 'User');
      const photo = localStorage.getItem('userPhoto') || null;
      const goals = sanitizeInput(localStorage.getItem('userGoals') || '');
      
      setProfile({ name, photo });
      setFormState(prev => ({ ...prev, tempName: name, goals, tempGoals: goals }));
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    window.addEventListener('profileLoaded', handleProfileLoaded);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('profileLoaded', handleProfileLoaded);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = actualTheme === 'dark';
  const tabs = [
    { id: 'general', label: t('general'), icon: SettingsIcon },
    { id: 'personalization', label: t('personalization'), icon: Palette },
    { id: 'privacy', label: t('privacy'), icon: Shield },
    { id: 'account', label: t('account'), icon: User },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`${isDark ? '' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl h-[80vh] max-h-[90vh] flex flex-col sm:flex-row overflow-hidden`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: isDark ? '#222222' : undefined }} onClick={(e) => e.stopPropagation()}>
        {/* Sidebar */}
        <div className={`w-full sm:w-64 ${isDark ? 'border-gray-700' : 'bg-gray-50 border-gray-200'} border-r-0 sm:border-r border-b sm:border-b-0 p-4 flex-shrink-0`} style={{ backgroundColor: isDark ? '#222222' : undefined }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'}`}>{t('settings')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`h-8 w-8 p-0 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
              <X className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </Button>
          </div>
          
          <nav className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-1 overflow-x-auto sm:overflow-x-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 sm:w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? isDark ? 'text-white' : 'bg-gray-200 text-black'
                      : isDark ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id && isDark ? '#333333' : undefined
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id && isDark) {
                      e.currentTarget.style.backgroundColor = '#333333';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id && isDark) {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-black'} mb-4`}>{t('general')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{t('theme')}</Label>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('theme.description')}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownStates(prev => ({ ...prev, theme: !prev.theme, language: false }))}
                      className={`px-4 py-2.5 pr-10 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer hover:shadow-sm flex items-center justify-between min-w-[120px] ${isDark ? 'border-gray-600 text-white focus:ring-blue-500 hover:border-gray-500' : 'border-gray-300 text-gray-900 focus:ring-blue-500 hover:border-gray-400 bg-white'}`}
                      style={{ backgroundColor: isDark ? '#222222' : undefined }}
                    >
                      {theme === 'system' ? t('system') : theme === 'light' ? t('light') : t('dark')}
                      <ChevronDown className={`w-4 h-4 transition-transform ${dropdownStates.theme ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownStates.theme && (
                      <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-50 overflow-hidden ${isDark ? 'border-gray-600' : 'border-gray-300 bg-white'}`} style={{ backgroundColor: isDark ? '#222222' : undefined }}>
                        {[{value: 'system', label: t('system')}, {value: 'light', label: t('light')}, {value: 'dark', label: t('dark')}].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setTheme(option.value as 'light' | 'dark' | 'system');
                              setDropdownStates(prev => ({ ...prev, theme: false }));
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-opacity-80 transition-colors ${isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} ${theme === option.value ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{t('language')}</Label>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('language.description')}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownStates(prev => ({ ...prev, language: !prev.language, theme: false }))}
                      className={`px-4 py-2.5 pr-10 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer hover:shadow-sm flex items-center justify-between min-w-[120px] ${isDark ? 'border-gray-600 text-white focus:ring-blue-500 hover:border-gray-500' : 'border-gray-300 text-gray-900 focus:ring-blue-500 hover:border-gray-400 bg-white'}`}
                      style={{ backgroundColor: isDark ? '#222222' : undefined }}
                    >
                      {language === 'en' ? t('english') : language === 'es' ? t('spanish') : language === 'fr' ? t('french') : language === 'de' ? t('german') : language === 'pt' ? t('portuguese') : language === 'zh' ? t('chinese') : language === 'ja' ? t('japanese') : t('korean')}
                      <ChevronDown className={`w-4 h-4 transition-transform ${dropdownStates.language ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownStates.language && (
                      <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-50 overflow-hidden ${isDark ? 'border-gray-600' : 'border-gray-300 bg-white'}`} style={{ backgroundColor: isDark ? '#222222' : undefined }}>
                        {[{value: 'en', label: t('english')}, {value: 'es', label: t('spanish')}, {value: 'fr', label: t('french')}, {value: 'de', label: t('german')}, {value: 'pt', label: t('portuguese')}, {value: 'zh', label: t('chinese')}, {value: 'ja', label: t('japanese')}, {value: 'ko', label: t('korean')}].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setLanguage(option.value as any);
                              setDropdownStates(prev => ({ ...prev, language: false }));
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-opacity-80 transition-colors ${isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} ${language === option.value ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'personalization' && (
            <div className="space-y-6">
              <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-black'} mb-4`}>{t('personalization')}</h3>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{t('more.about.you')}</Label>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('more.about.you.description')}</p>
                  </div>
                  <Textarea
                    value={formState.tempGoals}
                    onChange={(e) => handleGoalsChange(e.target.value)}
                    placeholder={t('goals.placeholder')}
                    className={`min-h-[120px] rounded-xl focus:outline-none focus:ring-0 focus:border-gray-600 ${isDark ? 'border-gray-600 text-white' : 'border-gray-300 bg-white text-black'}`}
                    style={{ fontSize: '16px', backgroundColor: isDark ? '#222222' : undefined, boxShadow: 'none' }}
                  />
                  {formState.goalsChanged && (
                    <Button
                      onClick={confirmGoalsChange}
                      className="mt-2"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t('confirm')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-black'} mb-4`}>{t('privacy')}</h3>
              
              <CookieSettings />
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{t('logout.device')}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogout();
                        }}
                        variant="outline"
                        size="sm"
                        className={`justify-start rounded-full bg-transparent hover:bg-transparent ${uiState.showLogoutConfirm ? 'bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600' : isDark ? 'border-white text-white hover:border-white hover:text-white' : 'border-black text-black hover:border-black hover:text-black'}`}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {uiState.showLogoutConfirm ? t('logout.confirm') : t('logout')}
                      </Button>
                      {uiState.showLogoutConfirm && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUiState(prev => ({ ...prev, showLogoutConfirm: false }));
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-full bg-transparent border-gray-500 text-gray-500 hover:bg-transparent hover:border-gray-500 hover:text-gray-500"
                        >
                          {t('cancel')}
                        </Button>
                      )}
                    </div>
                    {uiState.showLogoutConfirm && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {t('logout.confirm.message')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{t('logout.all')}</p>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('logout.all.description')}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogoutAllDevices();
                        }}
                        variant="outline"
                        size="sm"
                        className={`justify-start rounded-full bg-transparent hover:bg-transparent ${uiState.showLogoutAllConfirm ? 'bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600' : 'border-red-500 text-red-500 hover:border-red-500 hover:text-red-500'}`}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {uiState.showLogoutAllConfirm ? t('logout.all.confirm') : t('logout.all')}
                      </Button>
                      {uiState.showLogoutAllConfirm && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUiState(prev => ({ ...prev, showLogoutAllConfirm: false }));
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-full bg-transparent border-gray-500 text-gray-500 hover:bg-transparent hover:border-gray-500 hover:text-gray-500"
                        >
                          {t('cancel')}
                        </Button>
                      )}
                    </div>
                    {uiState.showLogoutAllConfirm && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {t('logout.all.confirm.message')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-black'} mb-4`}>{t('account')}</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{t('profile.photo')}</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                      {profile.photo ? (
                        <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <User className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <div className="flex flex-wrap gap-2">
                        <label
                          htmlFor="photo-upload"
                          className={`cursor-pointer px-3 py-1 text-sm rounded-xl border transition-colors ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-black hover:bg-gray-50'}`}
                          style={{ backgroundColor: isDark ? '#333333' : undefined }}
                        >
                          {t('upload.photo')}
                        </label>
                        {profile.photo && (
                          <>
                            <button
                              onClick={() => {
                                setTempImage(profile.photo);
                                setUiState(prev => ({ ...prev, showCropper: true }));
                              }}
                              className={`px-3 py-1 text-sm rounded-xl border transition-colors ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-black hover:bg-gray-50'}`}
                              style={{ backgroundColor: isDark ? '#333333' : undefined }}
                            >
                              {t('edit')}
                            </button>
                            <button
                              onClick={() => handleProfileChange('photo', '')}
                              className={`px-3 py-1 text-sm rounded-md ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'} sm:ml-0 mt-2 sm:mt-0`}
                            >
                              {t('remove')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{t('full.name')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formState.tempName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={`flex-1 rounded-xl focus:outline-none focus:ring-2 ${isDark ? 'border-gray-600 text-white focus:ring-gray-500' : 'border-gray-300 text-black focus:ring-gray-400'}`}
                      style={{ backgroundColor: isDark ? '#333333' : '#ffffff' }}
                    />
                    {formState.nameChanged && (
                      <Button
                        onClick={confirmNameChange}
                        size="sm"
                        className="px-3"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-4">
                  {!isGoogleUser && !uiState.showPasswordChange ? (
                    <Button 
                      onClick={handleChangePassword}
                      variant="outline"
                      size="sm"
                      className={`rounded-full bg-transparent ${isDark ? 'border-white text-white hover:bg-transparent hover:text-white hover:border-white' : 'border-black text-black hover:bg-transparent hover:text-black hover:border-black'}`}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {t('change.password')}
                    </Button>
                  ) : isGoogleUser ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('google.password.info')}
                    </p>
                  ) : (
                    <div className={`p-4 rounded-xl border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                      <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-black'}`}>{t('change.password')}</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('current.password')}</Label>
                          <Input
                            type="password"
                            value={passwordState.current}
                            onChange={(e) => setPasswordState(prev => ({ ...prev, current: e.target.value }))}
                            className={`mt-1 rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'}`}
                            placeholder={t('current.password')}
                          />
                        </div>
                        <div>
                          <Label className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('new.password')}</Label>
                          <Input
                            type="password"
                            value={passwordState.new}
                            onChange={(e) => setPasswordState(prev => ({ ...prev, new: e.target.value }))}
                            className={`mt-1 rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'}`}
                            placeholder={t('new.password')}
                          />
                        </div>
                        <div>
                          <Label className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('confirm.new.password')}</Label>
                          <Input
                            type="password"
                            value={passwordState.confirm}
                            onChange={(e) => setPasswordState(prev => ({ ...prev, confirm: e.target.value }))}
                            className={`mt-1 rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'}`}
                            placeholder={t('confirm.new.password')}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={handleChangePassword}
                            disabled={passwordState.loading || !passwordState.current || !passwordState.new || !passwordState.confirm}
                            size="sm"
                            className="flex-1"
                          >
                            {passwordState.loading ? t('updating') : t('update.password')}
                          </Button>
                          <Button
                            onClick={cancelPasswordChange}
                            variant="outline"
                            size="sm"
                            className={`bg-transparent hover:bg-transparent ${isDark ? 'border-white text-white hover:border-white hover:text-white' : 'border-black text-black hover:border-black hover:text-black'}`}
                          >
                            {t('cancel')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  {!uiState.showDeleteConfirm ? (
                    <Button 
                      onClick={handleDeleteAccount}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('delete.account')}
                    </Button>
                  ) : (
                    <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50'}`}>
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {t('delete.account.confirm')}
                      </h4>
                      <p className={`text-xs mb-3 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                        {t('delete.account.warning')}
                      </p>
                      <div className="space-y-3">
                        {!isGoogleUser && (
                          <div>
                            <Label className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                              {t('confirm.password.delete')}
                            </Label>
                            <Input
                              type="password"
                              value={deleteState.password}
                              onChange={(e) => setDeleteState(prev => ({ ...prev, password: e.target.value }))}
                              className={`mt-1 rounded-lg ${isDark ? 'border-red-500 bg-red-900/30 text-white placeholder-red-300' : 'border-red-300 bg-white text-black placeholder-red-400'}`}
                              placeholder={t('enter.password')}
                              disabled={deleteState.loading}
                            />
                          </div>
                        )}
                        {isGoogleUser && (
                          <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                            {t('google.account.delete.warning')}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleDeleteAccount}
                            disabled={deleteState.loading || (!isGoogleUser && !deleteState.password.trim())}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            {deleteState.loading ? t('deleting') : t('delete.permanently')}
                          </Button>
                          <Button
                            onClick={() => {
                              setUiState(prev => ({ ...prev, showDeleteConfirm: false }));
                              setDeleteState({ password: '', loading: false });
                            }}
                            variant="outline"
                            size="sm"
                            disabled={deleteState.loading}
                            className={`bg-transparent hover:bg-transparent ${isDark ? 'border-white text-white hover:border-white hover:text-white' : 'border-black text-black hover:border-black hover:text-black'}`}
                          >
                            {t('cancel')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {uiState.showCropper && tempImage && (
        <PhotoCropper
          imageSrc={tempImage}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default SettingsModal;