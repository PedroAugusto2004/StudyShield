import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, Link as LinkIcon } from "lucide-react";
import type { Message } from "@/hooks/useConversations";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationTitle: string;
  firstMessage: Message | null;
  shareUrl: string;
}

export const ShareModal = ({ isOpen, onClose, conversationTitle, firstMessage, shareUrl }: ShareModalProps) => {
  const { actualTheme } = useTheme();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const isDark = actualTheme === 'dark';

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const getPreviewText = () => {
    if (!firstMessage) return '';
    const content = firstMessage.content;
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${
        isDark ? 'border border-gray-700' : 'bg-white border border-gray-200'
      }`} style={isDark ? { backgroundColor: '#222222' } : undefined} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {conversationTitle}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`h-8 w-8 p-0 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-black hover:text-black hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div className={`rounded-lg p-4 mb-6 ${
            isDark ? 'border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`} style={isDark ? { backgroundColor: '#222222' } : undefined}>
            {firstMessage && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    You
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getPreviewText()}
                </p>
              </div>
            )}
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-xs text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                StudyShield
              </p>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <Button
              onClick={handleCopyLink}
              className={`w-full h-12 flex items-center justify-center gap-2 ${
                copied 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : isDark 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-all duration-200`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>

            <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Only users with a StudyShield account can view this conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
