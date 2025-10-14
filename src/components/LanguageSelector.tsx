import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface LanguageSelectorProps {
  variant?: 'desktop' | 'mobile' | 'compact';
  className?: string;
}

const LanguageSelector = ({ variant = 'desktop', className = '' }: LanguageSelectorProps) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { value: 'en', label: 'English', flag: 'US' },
    { value: 'es', label: 'Español', flag: 'ES' },
    { value: 'fr', label: 'Français', flag: 'FR' },
    { value: 'de', label: 'Deutsch', flag: 'DE' },
    { value: 'pt', label: 'Português', flag: 'BR' },
    { value: 'zh', label: '中文', flag: 'CN' },
    { value: 'ja', label: '日本語', flag: 'JP' },
    { value: 'ko', label: '한국어', flag: 'KR' }
  ];

  const currentLanguage = languages.find(lang => lang.value === language);
  console.log('Current language:', language, 'Flag:', currentLanguage?.flag);

  if (variant === 'compact') {
    return (
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value as any)}
        className={`appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-gray-400 ${className}`}
      >
        {languages.map(lang => (
          <option key={lang.value} value={lang.value}>{lang.flag} {lang.label}</option>
        ))}
      </select>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 bg-white border-2 border-blue-500 hover:border-blue-600 focus:border-blue-600 rounded-lg px-2 py-1.5 text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none shadow-sm hover:shadow-md ${className}`}
        >
          <img src={`https://flagcdn.com/w80/${currentLanguage?.flag.toLowerCase()}.png`} alt={currentLanguage?.label} className="w-5 h-4" />
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[140px]">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage(lang.value as any);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors duration-200 hover:bg-blue-50 ${
                    language === lang.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <img src={`https://flagcdn.com/w80/${lang.flag.toLowerCase()}.png`} alt={lang.label} className="w-5 h-4" />
                  <span className="flex-1">{lang.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop variant with custom dropdown
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border-2 border-blue-500 hover:border-blue-600 focus:border-blue-600 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 shadow-sm hover:shadow-md"
      >
        <img src={`https://flagcdn.com/w80/${currentLanguage?.flag.toLowerCase()}.png`} alt={currentLanguage?.label} className="w-5 h-4" />
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[180px]">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-200 hover:bg-blue-50 ${
                  language === lang.value 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <img src={`https://flagcdn.com/w80/${lang.flag.toLowerCase()}.png`} alt={lang.label} className="w-5 h-4" />
                <span className="flex-1">{lang.label}</span>
                {language === lang.value && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
