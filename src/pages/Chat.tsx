import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractTextFromPDF } from "@/lib/pdfUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SettingsModal from "@/components/SettingsModal";
import ConversationSidebar from "@/components/ConversationSidebar";
import HamsterLoader from "@/components/HamsterLoader";
import ChatErrorBoundary from "@/components/ChatErrorBoundary";
import { useConversations, type Message, type Conversation } from "@/hooks/useConversations";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useStreamingText } from "@/hooks/useStreamingText";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Bot, 
  User,
  Settings as SettingsIcon,
  LogOut,
  ArrowUp,
  ChevronDown,
  Zap,
  Copy,
  Menu,
  X,
  Check,
  WifiOff,
  Shield,
  Globe,
  Cpu,
  HelpCircle,
  Upload,
  Calculator,
  Lightbulb,
  BookOpen,
  Calendar,
  Sigma,
  Triangle,
  Landmark,
  ScrollText,
  Brain,
  GraduationCap,
  FileText,
  Target
} from "lucide-react";
import { aiService, type AIMode } from "@/services/aiService";
import { geminiService, type ChatMessage as GeminiChatMessage } from "@/services/geminiService";
import { AIModeSelector } from "@/components/AIModeSelector";
import PWAInstallPopup from "@/components/PWAInstallPopup";
import { ShareModal } from "@/components/ShareModal";
import "@/styles/pwa-popup.css";

// Copy Button Component with Animation
const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-6 w-6 p-0 transition-all duration-200 ${
        copied 
          ? 'bg-green-500 hover:bg-green-600' 
          : isDark 
            ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
            : 'hover:bg-gray-200 text-gray-600 hover:text-black'
      }`}
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="w-3 h-3 text-white" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </Button>
  );
};

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};


const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const { t } = useLanguage();
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    updateConversation,
    updateConversationTitle,
    deleteConversation,
    getCurrentConversation,
    isLoading: conversationsLoading
  } = useConversations();

  const generateTitle = (message: string): string => {
    // Simple title generation based on first message
    const words = message.trim().split(' ');
    if (words.length <= 4) return message;
    return words.slice(0, 4).join(' ') + '...';
  };
  

  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AIMode>('online');
  const [chatHistory, setChatHistory] = useState<GeminiChatMessage[]>([]);
  const [aiStatus, setAiStatus] = useState({ online: false, nanoAvailable: false, currentMode: 'online' as AIMode, availableModes: [] as AIMode[] });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const { streamingText: streamingMessage, updateStreamingText, resetStreamingText } = useStreamingText();
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<{[key: string]: string}>({});
  const [viewingFile, setViewingFile] = useState<{content: string; name: string; type: string} | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showOfflineHint, setShowOfflineHint] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [sharingConversationId, setSharingConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generationAbortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { smoothScrollToBottom } = useSmoothScroll();

  const studyQuestions = [
    { icon: Calculator, labelKey: 'study.quadratic', questionKey: 'study.quadratic.question' },
    { icon: Sigma, labelKey: 'study.derivatives', questionKey: 'study.derivatives.question' },
    { icon: Triangle, labelKey: 'study.pythagorean', questionKey: 'study.pythagorean.question' },
    { icon: Lightbulb, labelKey: 'study.photosynthesis', questionKey: 'study.photosynthesis.question' },
    { icon: Brain, labelKey: 'study.newton', questionKey: 'study.newton.question' },
    { icon: Target, labelKey: 'study.dna', questionKey: 'study.dna.question' },
    { icon: Landmark, labelKey: 'study.wwii', questionKey: 'study.wwii.question' },
    { icon: BookOpen, labelKey: 'study.french.revolution', questionKey: 'study.french.revolution.question' },
    { icon: ScrollText, labelKey: 'study.shakespeare', questionKey: 'study.shakespeare.question' },
    { icon: GraduationCap, labelKey: 'study.periodic.table', questionKey: 'study.periodic.table.question' },
    { icon: Calendar, labelKey: 'study.schedule', questionKey: 'study.schedule.question' },
    { icon: FileText, labelKey: 'study.essay', questionKey: 'study.essay.question' }
  ];

  const [randomQuestions, setRandomQuestions] = useState<typeof studyQuestions>([]);

  useEffect(() => {
    const shuffled = [...studyQuestions].sort(() => Math.random() - 0.5);
    setRandomQuestions(shuffled.slice(0, 4));
  }, [currentConversationId]);

  const renderMarkdownContent = (content: string) => {
    // Split content into sections
    const sections = content.split(/\n(?=#{1,6}\s)/);
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      if (!lines[0]) return null;
      
      // Check if it's a header
      const headerMatch = lines[0].match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        const content = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className={`font-semibold ${
                level === 1 ? 'text-lg' : 
                level === 2 ? 'text-base' : 'text-sm'
              } ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {parseInlineMarkdown(title)}
              </h3>
            </div>
            {content && (
              <div className="ml-4">
                {renderContent(content)}
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div key={index} className="mb-4">
          {renderContent(section)}
        </div>
      );
    });
  };
  
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        i++;
        continue;
      }
      
      // Tables
      if (line.includes('|') && lines[i + 1]?.includes('|')) {
        const tableLines = [];
        let j = i;
        while (j < lines.length && lines[j].includes('|')) {
          tableLines.push(lines[j]);
          j++;
        }
        
        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h).map(h => parseInlineMarkdown(h));
          const rows = tableLines.slice(2).map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell).map(cell => parseInlineMarkdown(cell))
          );
          
          elements.push(
            <div key={i} className="mb-4 overflow-x-auto">
              <table className={`w-full border-collapse border ${
                isDark ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <thead>
                  <tr className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>
                    {headers.map((header, idx) => (
                      <th key={idx} className={`border px-3 py-2 text-left text-sm font-medium ${
                        isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                      }`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className={`border px-3 py-2 text-sm ${
                          isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                        }`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          i = j;
          continue;
        }
      }
      
      // Code blocks
      if (line.startsWith('```')) {
        const language = line.substring(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        // Decode HTML entities in code
        const decodedCode = codeLines.join('\n')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#39;/g, "'");
        
        elements.push(
          <div key={i} className="mb-4">
            <div className={`rounded-lg overflow-hidden ${
              isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100 border border-gray-200'
            }`}>
              {language && (
                <div className={`px-4 py-2 text-xs font-medium flex items-center justify-between ${
                  isDark ? 'bg-gray-800 text-gray-300 border-b border-gray-700' : 'bg-gray-200 text-gray-600 border-b border-gray-300'
                }`}>
                  <span>{language}</span>
                  <CopyButton code={decodedCode} />
                </div>
              )}
              <pre className={`p-4 text-sm overflow-x-auto ${
                isDark ? 'text-gray-300' : 'text-gray-800'
              }`}>
                <code>{decodedCode}</code>
              </pre>
            </div>
          </div>
        );
        i++;
        continue;
      }
      
      // Quotes
      if (line.startsWith('>')) {
        const quoteLines = [];
        let j = i;
        while (j < lines.length && lines[j].startsWith('>')) {
          quoteLines.push(lines[j].substring(1).trim());
          j++;
        }
        
        elements.push(
          <div key={i} className={`mb-4 border-l-4 border-blue-500 pl-4 py-2 ${
            isDark ? 'bg-gray-800/50' : 'bg-gray-50'
          }`}>
            <p className={`text-sm italic ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {parseInlineMarkdown(quoteLines.join(' '))}
            </p>
          </div>
        );
        i = j;
        continue;
      }
      
      // Lists
      if (line.match(/^[•\-\*]\s/) || line.match(/^\d+\.\s/)) {
        const listItems = [];
        let j = i;
        while (j < lines.length && (lines[j].match(/^[•\-\*]\s/) || lines[j].match(/^\d+\.\s/) || lines[j].startsWith('  '))) {
          if (lines[j].trim()) {
            listItems.push(lines[j]);
          }
          j++;
        }
        
        const isOrdered = listItems[0]?.match(/^\d+\.\s/);
        const ListTag = isOrdered ? 'ol' : 'ul';
        
        elements.push(
          <ListTag key={i} className={`mb-4 ml-4 space-y-1 ${
            isOrdered ? 'list-decimal' : 'list-disc'
          }`}>
            {listItems.map((item, idx) => {
              const cleanItem = item.replace(/^[•\-\*]\s|^\d+\.\s/, '').trim();
              return (
                <li key={idx} className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {parseInlineMarkdown(cleanItem)}
                </li>
              );
            })}
          </ListTag>
        );
        i = j;
        continue;
      }
      
      // Warning/Tip boxes
      if (line.startsWith('⚠️') || line.startsWith('💡') || line.startsWith('🔥')) {
        const icon = line.charAt(0);
        const text = line.substring(2).trim();
        const bgColor = 
          icon === '⚠️' ? (isDark ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-300') :
          icon === '💡' ? (isDark ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-300') :
          (isDark ? 'bg-red-900/20 border-red-600' : 'bg-red-50 border-red-300');
        
        elements.push(
          <div key={i} className={`mb-4 p-3 rounded-lg border ${bgColor}`}>
            <p className={`text-sm flex items-start gap-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span>{icon}</span>
              <span>{parseInlineMarkdown(text)}</span>
            </p>
          </div>
        );
        i++;
        continue;
      }
      
      // Regular paragraphs
      elements.push(
        <p key={i} className={`mb-3 text-sm leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {parseInlineMarkdown(line)}
        </p>
      );
      i++;
    }
    
    return elements;
  };

  const parseInlineMarkdown = (text: string) => {
    if (typeof text !== 'string') return text;
    
    // Sanitize input first to prevent XSS
    const sanitizedText = DOMPurify.sanitize(text, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    });
    
    // Handle bold text with ** syntax - more comprehensive regex
    const parts = sanitizedText.split(/(\*\*[^*]*\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const content = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{content}</strong>;
      }
      return part;
    }).filter(part => part !== '');
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = async (files: File[]) => {
    // Check file size for offline mode (max 200KB per image)
    if (selectedMode === 'offline') {
      const oversizedFiles = files.filter(f => f.type.startsWith('image/') && f.size > 200000);
      if (oversizedFiles.length > 0) {
        alert(`Image too large for offline mode. Please use images smaller than 200KB.\n\nLarge files: ${oversizedFiles.map(f => `${f.name} (${(f.size / 1024).toFixed(0)}KB)`).join(', ')}`);
        return;
      }
    }
    
    setAttachedFiles(prev => [...prev, ...files]);
    
    // Generate preview URLs for images
    const newPreviewUrls: {[key: string]: string} = {};
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviewUrls[file.name] = URL.createObjectURL(file);
      }
    });
    setFilePreviewUrls(prev => ({...prev, ...newPreviewUrls}));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files: File[] = [];
    
    items.forEach(item => {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    });
    
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const removeFile = (index: number) => {
    const file = attachedFiles[index];
    if (file && filePreviewUrls[file.name]) {
      URL.revokeObjectURL(filePreviewUrls[file.name]);
      setFilePreviewUrls(prev => {
        const updated = {...prev};
        delete updated[file.name];
        return updated;
      });
    }
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
      
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  useEffect(() => {
    // Update greeting message when language changes
    const userName = localStorage.getItem('userName') || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    
    // Generate greeting with current translations
    const hour = new Date().getHours();
    const greetings = [
      t('good.to.see.again'),
      t('welcome.back.user'),
      t('ready.to.learn'),
      t('continue.studying')
    ];
    
    let greeting;
    if (hour < 12) greeting = t('good.morning');
    else if (hour < 17) greeting = t('good.afternoon');
    else if (hour < 21) greeting = t('good.evening');
    else {
      const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0');
      if (sessionCount > 0) {
        greeting = greetings[sessionCount % greetings.length];
      } else {
        greeting = t('good.night');
      }
    }
    
    const newGreetingContent = `${greeting}, ${userName}!`;
    // Removed console.log to prevent user data exposure
    
    // Always update or create greeting message when language changes
    setMessages(prev => {
      if (prev.length === 0 || prev.every(msg => msg.type !== 'greeting')) {
        // Create new greeting if none exists
        return [{
          id: Date.now(),
          type: 'greeting' as const,
          content: newGreetingContent,
          timestamp: new Date()
        }];
      } else {
        // Update existing greeting
        return prev.map(msg => 
          msg.type === 'greeting' 
            ? { ...msg, content: newGreetingContent }
            : msg
        );
      }
    });
  }, [t, user]); // Depend on translation function and user

  useEffect(() => {
    // Increment session count for different greetings (only once on mount)
    const currentCount = parseInt(localStorage.getItem('sessionCount') || '0');
    localStorage.setItem('sessionCount', (currentCount + 1).toString());
  }, []); // Run only once on mount

  useEffect(() => {
    const handleNameUpdate = (event: CustomEvent) => {
      const newName = event.detail.name;
      
      // Generate greeting with current translations
      const hour = new Date().getHours();
      const greetings = [
        t('good.to.see.again'),
        t('welcome.back.user'),
        t('ready.to.learn'),
        t('continue.studying')
      ];
      
      let greeting;
      if (hour < 12) greeting = t('good.morning');
      else if (hour < 17) greeting = t('good.afternoon');
      else if (hour < 21) greeting = t('good.evening');
      else {
        const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0');
        if (sessionCount > 0) {
          greeting = greetings[sessionCount % greetings.length];
        } else {
          greeting = t('good.night');
        }
      }
      
      setMessages(prev => prev.map(msg => 
        msg.type === 'greeting' 
          ? { ...msg, content: `${greeting}, ${newName}!` }
          : msg
      ));
    };

    window.addEventListener('nameUpdated', handleNameUpdate as EventListener);
    return () => window.removeEventListener('nameUpdated', handleNameUpdate as EventListener);
  }, [t]);

  useEffect(() => {
    // Initialize AI service and check status
    const updateAiStatus = () => {
      const status = aiService.getStatus();
      setAiStatus(status);
      setSelectedMode(status.currentMode);
    };
    
    updateAiStatus();
    
    // Listen for network changes
    const handleOnline = () => updateAiStatus();
    const handleOffline = () => updateAiStatus();
    
    // Listen for personalization updates
    const handlePersonalizationUpdate = async () => {
      const { geminiNanoService } = await import('@/services/geminiNanoService');
      await geminiNanoService.updatePersonalization();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('personalizationUpdated', handlePersonalizationUpdate);
    
    // Periodic status check
    const checkInterval = setInterval(updateAiStatus, 30000);
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionClass();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Fix iOS keyboard overlay issue
    const handleResize = () => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('personalizationUpdated', handlePersonalizationUpdate);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Load current conversation messages
    const currentConv = getCurrentConversation();
    if (currentConversationId && currentConv && currentConv.messages.length > 0) {
      setMessages(currentConv.messages);
      setChatHistory(currentConv.chatHistory || []);
      setIsChatMode(true);
    } else if (!currentConversationId) {
      // Only reset to greeting when no conversation is selected (not when conversation is empty)
      setIsChatMode(false);
      
      // Generate greeting with current translations
      const userName = localStorage.getItem('userName') || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
      const hour = new Date().getHours();
      const greetings = [
        t('good.to.see.again'),
        t('welcome.back.user'),
        t('ready.to.learn'),
        t('continue.studying')
      ];
      
      let greeting;
      if (hour < 12) greeting = t('good.morning');
      else if (hour < 17) greeting = t('good.afternoon');
      else if (hour < 21) greeting = t('good.evening');
      else {
        const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0');
        if (sessionCount > 0) {
          greeting = greetings[sessionCount % greetings.length];
        } else {
          greeting = t('good.night');
        }
      }
      
      const greetingMessage = {
        id: Date.now(),
        type: 'greeting' as const,
        content: `${greeting}, ${userName}!`,
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
      setChatHistory([]);
    }
  }, [currentConversationId, getCurrentConversation, t]);

  // Handle page visibility changes (when user comes back to the tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentConversationId) {
        const currentConv = getCurrentConversation();
        if (currentConv && currentConv.messages.length > 0) {
          setMessages(currentConv.messages);
          setChatHistory(currentConv.chatHistory || []);
          setIsChatMode(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentConversationId, getCurrentConversation]);

  const handleSendMessage = async (messageOverride?: string) => {
    const trimmedInput = (messageOverride || inputValue).trim();
    if ((!trimmedInput && attachedFiles.length === 0) || isTyping) return;

    // Hide offline hint after first message
    if (showOfflineHint) {
      setShowOfflineHint(false);
    }

    // Separate display content from AI content
    let displayContent = trimmedInput;
    let aiContent = trimmedInput;
    let fileContents: { name: string; type: string; content: string }[] = [];
    
    // Process attached files
    if (attachedFiles.length > 0) {
      const fileData = await Promise.all(
        attachedFiles.map(async (file) => {
          const content = await readFileContent(file);
          return { file, content };
        })
      );
      
      fileContents = fileData.map(({ file, content }) => ({
        name: file.name,
        type: file.type,
        content
      }));
      
      // For AI: include file contents
      const aiFileContents = await Promise.all(fileData.map(async ({ file, content }) => {
        if (file.type.startsWith('image/')) {
          return `[Image: ${file.name}]\n${content}`;
        } else if (file.type === 'application/pdf') {
          // For PDFs, send as inline data for Gemini to process directly
          return `[File: ${file.name}]\n${content}`;
        } else {
          return `[File: ${file.name}]\n${content}`;
        }
      }));
      
      aiContent = `${trimmedInput}\n\n${aiFileContents.join('\n\n')}`;
    }

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: displayContent,
      timestamp: new Date(),
      files: attachedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
      fileContents
    };

    // Switch to chat mode immediately and update messages
    const nonGreetingMessages = messages.filter(msg => msg.type !== 'greeting');
    const updatedMessages = [...nonGreetingMessages, userMessage];
    
    // Immediately switch to chat mode and update messages synchronously
    setIsChatMode(true);
    setMessages(updatedMessages);
    
    // Smooth scroll to bottom when user sends a message
    smoothScrollToBottom(messagesContainerRef.current, 100);
    
    setInputValue("");
    setAttachedFiles([]);
    setIsTyping(true);
    setIsGenerating(true);
    
    // Create abort controller for stopping generation
    generationAbortRef.current = new AbortController();

    // Create new conversation if none exists
    let conversationId = currentConversationId;
    let isNewConversation = false;
    if (!conversationId) {
      const newConv = createNewConversation();
      // Removed console.log to prevent user data exposure
      conversationId = newConv.id;
      isNewConversation = true;
    }

    // Always update conversation with current messages
    updateConversation(conversationId, {
      messages: updatedMessages
    });

    // Update title for new conversations after messages are set
    if (isNewConversation && conversationId) {
      const title = generateTitle(trimmedInput);
      // Removed console.log to prevent user data exposure
      updateConversation(conversationId, { title });
    }

    try {
      // Add user goals and context
      const userGoals = localStorage.getItem('userGoals');
      const userName = localStorage.getItem('userName') || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
      
      // Different prompts for online vs offline
      let enhancedContent;
      if (selectedMode === 'online') {
        const goalsContext = userGoals ? `\n\nUser's goals and context: ${userGoals}` : '';
        enhancedContent = `${aiContent}${goalsContext}\n\nIMPORTANT: Use the user's name (${userName}) sparingly - only in greetings, personal responses, or when directly addressing them. Don't repeat the name multiple times in the same response. Use relevant emojis throughout your response to make it more engaging and visually appealing. Use emojis that relate to the topic being discussed. If the user has provided goals, tailor your response to help them achieve those objectives.`;
      } else {
        // Simpler prompt for offline mode
        enhancedContent = aiContent;
      }
      
      if (selectedMode === 'online') {
        // Use streaming for online mode
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        if (generationAbortRef.current?.signal.aborted) return;
        
        setIsTyping(false);
        setIsStreaming(true);
        resetStreamingText();
        
        let fullResponse = '';
        
        let aiResponse;
        try {
          aiResponse = await geminiService.sendMessageStream(
            enhancedContent,
            'flash',
            chatHistory,
            generationAbortRef.current?.signal,
            (chunk: string) => {
              if (!generationAbortRef.current?.signal.aborted) {
                fullResponse += chunk;
                updateStreamingText(fullResponse);
              }
            }
          );
        } catch (streamError) {
          if (streamError.message === 'Request was aborted' && fullResponse.trim()) {
            // Use partial response when aborted
            const aiMessage: Message = {
              id: Date.now() + 2,
              type: 'ai',
              content: fullResponse,
              timestamp: new Date()
            };
            
            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);
            
            if (conversationId) {
              const currentConv = getCurrentConversation();
              updateConversation(conversationId, {
                title: currentConv?.title || generateTitle(trimmedInput),
                lastMessage: fullResponse.length > 100 ? fullResponse.substring(0, 100) + '...' : fullResponse,
                messages: finalMessages,
                chatHistory: [...chatHistory, { role: 'user', parts: [{ text: trimmedInput }] }, { role: 'model', parts: [{ text: fullResponse }] }]
              });
            }
            return;
          }
          throw streamError;
        }
        
        if (!generationAbortRef.current?.signal.aborted) {
          setIsStreaming(false);
          
          const aiMessage: Message = {
            id: Date.now() + 2,
            type: 'ai',
            content: aiResponse,
            timestamp: new Date()
          };
          
          const finalMessages = [...updatedMessages, aiMessage];
          setMessages(finalMessages);
          
          const newUserHistory: GeminiChatMessage = { role: 'user', parts: [{ text: trimmedInput }] };
          const aiHistoryMessage: GeminiChatMessage = { role: 'model', parts: [{ text: aiResponse }] };
          const updatedHistory = [...chatHistory, newUserHistory, aiHistoryMessage];
          setChatHistory(updatedHistory);
          
          if (conversationId) {
            const currentConv = getCurrentConversation();
            updateConversation(conversationId, {
              title: currentConv?.title || generateTitle(trimmedInput),
              lastMessage: aiResponse.length > 100 ? aiResponse.substring(0, 100) + '...' : aiResponse,
              messages: finalMessages,
              chatHistory: updatedHistory
            });
          }
        }
      } else {
        // Use non-streaming for offline mode with simpler prompt
        const aiResponse = await aiService.sendMessage(aiContent, {
          abortSignal: generationAbortRef.current?.signal,
          forceMode: selectedMode
        });
        
        const aiMessage: Message = {
          id: Date.now() + 2,
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        if (conversationId) {
          const currentConv = getCurrentConversation();
          updateConversation(conversationId, {
            title: currentConv?.title || generateTitle(trimmedInput),
            lastMessage: aiResponse.length > 100 ? aiResponse.substring(0, 100) + '...' : aiResponse,
            messages: finalMessages,
            chatHistory: []
          });
        }
      }

      

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // If we have partial streaming content, preserve it instead of showing error
      if (streamingMessage.trim()) {
        const aiMessage: Message = {
          id: Date.now() + 2,
          type: 'ai',
          content: streamingMessage,
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        if (conversationId) {
          const currentConv = getCurrentConversation();
          updateConversation(conversationId, {
            title: currentConv?.title || generateTitle(trimmedInput),
            lastMessage: streamingMessage.length > 100 ? streamingMessage.substring(0, 100) + '...' : streamingMessage,
            messages: finalMessages,
            chatHistory: selectedMode === 'online' ? [...chatHistory, { role: 'user', parts: [{ text: trimmedInput }] }, { role: 'model', parts: [{ text: streamingMessage }] }] : []
          });
        }
        return;
      }
      
      // Determine specific error message
      let errorContent = t('ai.response.error');
      if (error.message?.includes('too large') || error.message?.includes('QuotaExceededError')) {
        errorContent = '⚠️ **Image Too Large**\n\nThe attached image is too large for offline mode. Please use an image smaller than 200KB, or switch to online mode for larger files.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorContent = '⚠️ **Network Error**\n\nUnable to connect to the AI service. Please check your internet connection and try again.';
      } else if (error.message) {
        errorContent = `⚠️ **Error**\n\n${error.message}`;
      }
      
      const errorMessage: Message = {
        id: Date.now() + 3,
        type: 'ai',
        content: errorContent,
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Update conversation with error
      if (conversationId) {
        const currentConv = getCurrentConversation();
        updateConversation(conversationId, {
          title: currentConv?.title || generateTitle(trimmedInput),
          lastMessage: 'Error occurred',
          messages: finalMessages,
          chatHistory: selectedMode === 'online' ? [...chatHistory, { role: 'user', parts: [{ text: trimmedInput }] }, { role: 'model', parts: [{ text: streamingMessage }] }] : []
        });
      }
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      setIsGenerating(false);
      resetStreamingText();
      generationAbortRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    // If conversation has a title update, handle it
    if (conversation.title !== conversations.find(c => c.id === conversation.id)?.title) {
      updateConversationTitle(conversation.id, conversation.title);
    }
    // Update timestamp to move conversation to top
    updateConversation(conversation.id, { timestamp: new Date() });
    setCurrentConversationId(conversation.id);
    setSidebarCollapsed(true);
  };

  const handleNewConversation = () => {
    // Reset to greeting mode
    setIsChatMode(false);
    
    // Generate greeting with current translations
    const userName = localStorage.getItem('userName') || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const hour = new Date().getHours();
    const greetings = [
      t('good.to.see.again'),
      t('welcome.back.user'),
      t('ready.to.learn'),
      t('continue.studying')
    ];
    
    let greeting;
    if (hour < 12) greeting = t('good.morning');
    else if (hour < 17) greeting = t('good.afternoon');
    else if (hour < 21) greeting = t('good.evening');
    else {
      const sessionCount = parseInt(localStorage.getItem('sessionCount') || '0');
      if (sessionCount > 0) {
        greeting = greetings[sessionCount % greetings.length];
      } else {
        greeting = t('good.night');
      }
    }
    
    const greetingMessage = {
      id: Date.now(),
      type: 'greeting' as const,
      content: `${greeting}, ${userName}!`,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
    setChatHistory([]);
    setCurrentConversationId(null);
    setSidebarCollapsed(true);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    // Redirect to new chat after deletion
    handleNewConversation();
  };

  const handleShareConversation = async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        const shareId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const { error } = await supabase
          .from('conversations')
          .update({ 
            is_shared: true, 
            share_id: shareId 
          })
          .eq('id', id);
        
        if (error) throw error;
        
        const url = `${window.location.origin}/shared/${shareId}`;
        setShareUrl(url);
        setSharingConversationId(id);
        setShowShareModal(true);
      } catch (error) {
        console.error('Error sharing conversation:', error);
      }
    }
  };

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/');
    setShowLogoutModal(false);
  };

  const handleMicClick = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleStopGeneration = () => {
    if (generationAbortRef.current) {
      generationAbortRef.current.abort();
      generationAbortRef.current = null;
    }
    
    // Preserve the streamed content as a permanent message with stop notice
    if (streamingMessage.trim()) {
      const contentWithNotice = `${streamingMessage}\n\n*${t('you.stopped.response')}*`;
      const aiMessage: Message = {
        id: Date.now() + 2,
        type: 'ai',
        content: contentWithNotice,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation with partial response
      if (currentConversationId) {
        const currentConv = getCurrentConversation();
        updateConversation(currentConversationId, {
          title: currentConv?.title || 'Interrupted conversation',
          lastMessage: streamingMessage.length > 100 ? streamingMessage.substring(0, 100) + '...' : streamingMessage,
          messages: [...messages, aiMessage],
          chatHistory: [...chatHistory, { role: 'model', parts: [{ text: contentWithNotice }] }]
        });
      }
    }
    
    setIsGenerating(false);
    setIsTyping(false);
    setIsStreaming(false);
    resetStreamingText();
  };



  const isDark = actualTheme === 'dark';

  if (conversationsLoading) {
    return <HamsterLoader />;
  }

  return (
    <div className={`${isDark ? 'bg-black' : 'bg-white'} flex overflow-hidden`} style={{ height: '100dvh' }}>
      <PWAInstallPopup />
      {/* Sidebar */}
      <ConversationSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onShareConversation={handleShareConversation}
      />
      
      {/* Main Chat Area */}
      <div className={`${isDark ? 'bg-black' : 'bg-white'} flex flex-col flex-1 min-w-0`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-black' : 'bg-white'} px-4 sm:px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu */}
            <Button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              variant="ghost"
              size="sm"
              className={`md:hidden p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'}`}
            >
              <div className="flex flex-col gap-1.5 w-5">
                <div className="h-0.5 w-full rounded-full bg-current" />
                <div className="h-0.5 w-3/4 rounded-full bg-current" />
              </div>
            </Button>
            <img 
              src={isDark ? "/StudyShield-white.png" : "/studyshield-logo.png"} 
              alt="StudyShield" 
              className="h-6 sm:h-8 w-auto"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full mr-2 sm:mr-4">
                <Avatar className="h-10 w-10">
                  {localStorage.getItem('userPhoto') ? (
                    <img 
                      src={localStorage.getItem('userPhoto') || ''} 
                      alt="Profile" 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-100 text-black border border-gray-300">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`w-56 ${isDark ? 'border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-md border`} style={{ backgroundColor: isDark ? '#222222' : undefined }} align="end">
              <DropdownMenuItem onClick={() => { setIsSettingsOpen(true); setActiveTab('personalization'); }} className={isDark ? 'text-white' : 'text-black'}>
                <User className="mr-2 h-4 w-4" />
                {t('personalization')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className={isDark ? 'text-white' : 'text-black'}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/help')} className={isDark ? 'text-white' : 'text-black'}>
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('help.center')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowLogoutModal(true)}
                className={isDark ? 'text-white' : 'text-black'}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Offline Hint */}
      {showOfflineHint && selectedMode === 'offline' && (
        <div className={`${isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border-b px-4 py-3 animate-fade-in`}>
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-sm">
            <WifiOff className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className={`${isDark ? 'text-blue-300' : 'text-blue-700'} text-center`}>
              {t('offline.hint')}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 p-4 sm:p-6 ${isDark ? 'bg-black dark-scrollbar' : 'bg-gray-50 light-scrollbar'} overflow-y-auto relative`} 
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Share Button - Fixed position, only show when in chat mode */}
        {isChatMode && currentConversationId && (
          <div className="fixed top-20 right-4 sm:right-6 z-10 hidden sm:block">
            <Button
              onClick={() => currentConversationId && handleShareConversation(currentConversationId)}
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 rounded-full p-2.5 sm:px-3 sm:py-2 backdrop-blur-md ${isDark ? 'bg-black/30 text-white hover:bg-gray-800/50' : 'bg-white/30 text-black hover:bg-gray-100/50 hover:text-black'} transition-all duration-200`}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{t('share')}</span>
            </Button>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.filter(msg => isChatMode ? msg.type !== 'greeting' : true).map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'greeting' ? 'justify-center' :
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'greeting' ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] px-4 gap-6">
                  <h2 className={`text-2xl sm:text-4xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} text-center animate-fade-in`}>{message.content}</h2>
                  
                  {/* Study Shortcuts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-2xl animate-fade-in">
                    {randomQuestions.map((q, idx) => {
                      const Icon = q.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (isTyping) return;
                            handleSendMessage(t(q.questionKey));
                          }}
                          className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 flex flex-col items-center gap-2 ${
                            isDark 
                              ? 'bg-black border-gray-700 hover:border-blue-500 text-white' 
                              : 'bg-white border-gray-200 hover:border-blue-500 text-gray-900'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium text-center">{t(q.labelKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className={`flex gap-2 sm:gap-3 max-w-xs sm:max-w-2xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center overflow-hidden ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : ''
                  }`}>
                    {message.type === 'user' 
                      ? (localStorage.getItem('userPhoto') ? (
                          <img 
                            src={localStorage.getItem('userPhoto') || ''} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        ))
                      : <img src={isDark ? "/white-icon.png" : "/Icon.png"} alt="AI" className="w-3 h-3 sm:w-4 sm:h-4" />
                    }
                  </div>

                  <div className={`smooth-transition ${
                    message.type === 'user'
                      ? 'p-3 sm:p-4 rounded-2xl bg-blue-500 text-white'
                      : 'w-full'
                  }`}>
                    {message.type === 'user' ? (
                      <>
                        <p className="text-sm leading-relaxed text-white">{DOMPurify.sanitize(message.content, { ALLOWED_TAGS: [], KEEP_CONTENT: true })}</p>
                        {message.files && message.files.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {message.files.map((file, idx) => (
                                <div key={idx}>
                                  {file.type.startsWith('image/') ? (
                                    <div className="bg-blue-600/20 p-2 rounded">
                                      <div className="text-xs text-blue-100 mb-1">
                                        🖼️ {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                      </div>
                                      <img 
                                        src={message.fileContents?.[idx]?.content} 
                                        alt={file.name}
                                        className="w-20 h-20 object-cover rounded border border-blue-400/30 cursor-pointer"
                                        onClick={() => setViewingFile({
                                          content: message.fileContents?.[idx]?.content || '',
                                          name: file.name,
                                          type: file.type
                                        })}
                                      />
                                    </div>
                                  ) : (
                                    <div 
                                      className="text-xs text-blue-100 bg-blue-600/20 px-2 py-1 rounded cursor-pointer hover:bg-blue-600/30"
                                      onClick={() => setViewingFile({
                                        content: message.fileContents?.[idx]?.content || '',
                                        name: file.name,
                                        type: file.type
                                      })}
                                    >
                                      {file.type === 'application/pdf' ? '📄' : '📎'} {file.name} ({(file.size / 1024).toFixed(1)}KB)
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs mt-2 text-blue-100">
                          {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="prose prose-sm max-w-none message-appear">
                          {renderMarkdownContent(message.content)}
                        </div>
                        <p className={`text-xs mt-4 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {(isGenerating || isStreaming) && (
            <div className="flex justify-start message-appear">
              <div className="flex gap-2 sm:gap-3 max-w-xs sm:max-w-2xl items-center">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                  <img src={isDark ? "/white-icon.png" : "/Icon.png"} alt="AI" className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="streaming-container">
                  {isStreaming ? (
                    <div className="prose prose-sm max-w-none streaming-text">
                      {renderMarkdownContent(streamingMessage)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full thinking-dots"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full thinking-dots" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full thinking-dots" style={{ animationDelay: '0.6s' }}></div>
                      </div>
                      {selectedMode === 'offline' && (
                        <p className={`text-xs italic animate-pulse ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {t('processing.locally')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div 
        className={`${isDark ? 'bg-black' : 'bg-white'} p-3 sm:p-6 relative`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className={`absolute inset-0 ${isDark ? 'bg-blue-900/20' : 'bg-blue-100/80'} border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10`}>
            <div className="text-center">
              <Paperclip className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Drop files here to attach
              </p>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className={`border-2 rounded-2xl p-3 bg-transparent transition-all duration-500 ${
            selectedMode === 'offline' 
              ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
              : 'border-gray-400'
          }`}>
            {isListening ? (
              <div className="flex items-center justify-center w-full py-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full animate-pulse ${
                          isDark ? 'bg-white' : 'bg-black'
                        }`}
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.5s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
                placeholder={t('what.do.you.want.to.learn')}
                className={`w-full bg-transparent border-0 focus-visible:ring-0 focus:outline-none text-sm px-1 py-2 ${isDark ? 'text-white placeholder:text-gray-400' : 'text-black placeholder:text-gray-500'}`}
                disabled={isTyping}
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
                spellCheck="true"
                inputMode="text"
                name="chat-message"
                id="chat-input"
                data-form-type="other"
                style={{ fontSize: '16px', outline: 'none', boxShadow: 'none' }}
              />
            )}
            
            {/* File attachments preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className={`relative group ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  } rounded-lg p-2`}>
                    {file.type.startsWith('image/') ? (
                      <div className="relative">
                        <img 
                          src={filePreviewUrls[file.name]} 
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={() => setViewingFile({
                            content: filePreviewUrls[file.name],
                            name: file.name,
                            type: file.type
                          })}
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs hover:opacity-80 ${
                            isDark ? 'bg-white text-black' : 'bg-black text-white'
                          }`}
                        >
                          ×
                        </button>
                        <div className="text-xs mt-1 truncate w-16">{file.name}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {file.type === 'application/pdf' ? '📄' : '📎'} {file.name}
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              {isListening ? (
                <div className="flex items-center justify-center w-full gap-4">
                  <Button
                    onClick={() => {
                      recognition?.stop();
                      setIsListening(false);
                      setInputValue('');
                    }}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      recognition?.stop();
                      setIsListening(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={selectedMode === 'offline' ? 'image/*' : 'image/*,application/pdf,.pdf,.txt,.doc,.docx,.json,.csv,.md'}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      onClick={handleFileSelect}
                      variant="ghost"
                      size="sm"
                      className={`flex-shrink-0 h-8 w-8 rounded-full smooth-transition ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'}`}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex-shrink-0 h-8 px-3 rounded-full flex items-center gap-1 smooth-transition ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'}`}
                        >
                          {selectedMode === 'online' ? (
                            <>
                              <Zap className="w-3 h-3" />
                              <span className="text-sm font-medium">Flash</span>
                            </>
                          ) : (
                            <>
                              <Cpu className="w-3 h-3" />
                              <span className="text-sm font-medium">Nano</span>
                            </>
                          )}
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={`${isDark ? 'border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-md border`} style={{ backgroundColor: isDark ? '#222222' : undefined }} align="start">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedMode('offline');
                            aiService.setConfig({ preferredMode: 'offline' });
                            setShowOfflineHint(true);
                          }}
                          className={`${isDark ? 'text-white' : 'text-black'} ${selectedMode === 'offline' ? 'bg-blue-500/10' : ''}`}
                        >
                          <Cpu className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>Gemini Nano</span>
                            <span className={`text-xs ${aiStatus.nanoAvailable ? 'text-green-500' : 'text-red-500'}`}>
                              {aiStatus.nanoAvailable ? t('ready') : t('unavailable')}
                            </span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedMode('online');
                            aiService.setConfig({ preferredMode: 'online' });
                          }}
                          className={`${isDark ? 'text-white' : 'text-black'} ${selectedMode === 'online' ? 'bg-blue-500/10' : ''}`}
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Gemini 2.5 Flash 
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleMicClick}
                      variant="ghost"
                      size="sm"
                      className={`flex-shrink-0 h-8 w-8 rounded-full smooth-transition ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    
                    <button
                      onClick={isGenerating ? handleStopGeneration : handleSendMessage}
                      disabled={(!inputValue.trim() && attachedFiles.length === 0) && !isGenerating}
                      className={`flex-shrink-0 h-8 w-8 rounded-full focus:outline-none items-center justify-center flex smooth-transition ${
                        isGenerating
                          ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                          : (!inputValue.trim() && attachedFiles.length === 0)
                            ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'
                            : isDark ? 'bg-white text-black' : 'bg-black text-white'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent', outline: 'none', border: 'none' }}
                    >
                      {isGenerating ? (
                        <div className={`w-3 h-3 ${isDark ? 'bg-black' : 'bg-white'} rounded-sm`} />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('studyshield.can.make.mistakes')}
          </p>
        </div>
      </div>

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          initialTab={activeTab}
        />
        
        {/* File Viewer Modal */}
        {viewingFile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className={`max-w-4xl max-h-[90vh] w-full ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } rounded-lg overflow-hidden`}>
              <div className={`flex items-center justify-between p-4 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h3 className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{viewingFile.name}</h3>
                <button
                  onClick={() => setViewingFile(null)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600'
                  }`}
                >
                  ×
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                {viewingFile.type.startsWith('image/') ? (
                  <img 
                    src={viewingFile.content} 
                    alt={viewingFile.name}
                    className="max-w-full h-auto mx-auto"
                  />
                ) : viewingFile.type === 'application/pdf' ? (
                  <iframe 
                    src={viewingFile.content}
                    className="w-full h-96"
                    title={viewingFile.name}
                  />
                ) : (
                  <pre className={`text-sm whitespace-pre-wrap ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {viewingFile.content}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowLogoutModal(false)}>
            <div className="max-w-md w-full rounded-lg p-6" style={{ backgroundColor: isDark ? '#222222' : '#ffffff' }} onClick={(e) => e.stopPropagation()}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{t('confirm.logout')}</h3>
              <p className={`mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>{t('are.you.sure.logout')}</p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowLogoutModal(false)}
                  variant="ghost"
                  className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}
                >
                  {t('no')}
                </Button>
                <Button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {t('yes')}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => { setShowShareModal(false); setSharingConversationId(null); }}
          conversationTitle={conversations.find(c => c.id === sharingConversationId)?.title || 'Conversation'}
          firstMessage={conversations.find(c => c.id === sharingConversationId)?.messages.find(m => m.type === 'user') || null}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  );
};

const ChatWithErrorBoundary = () => (
  <ChatErrorBoundary>
    <Chat />
  </ChatErrorBoundary>
);

export default ChatWithErrorBoundary;