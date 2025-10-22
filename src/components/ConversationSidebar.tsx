import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MessageSquare, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  History,
  Trash2,
  Edit2,
  Check,
  X,
  Menu,
  PenTool,
  PencilLine,
  MoreVertical,
  Share2
} from "lucide-react";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: any[];
}

interface ConversationSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onShareConversation?: (id: string) => void;
}

const ConversationSidebar = ({
  isCollapsed,
  onToggle,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onShareConversation
}: ConversationSidebarProps) => {
  const { actualTheme } = useTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isDark = actualTheme === 'dark';
  
  // Removed console.log to prevent user data exposure

  const handleEditStart = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = () => {
    if (editingId && editTitle.trim()) {
      // Update conversation title through parent component
      const conversation = conversations.find(c => c.id === editingId);
      if (conversation) {
        onSelectConversation({ ...conversation, title: editTitle.trim() });
      }
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteConversation(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const filteredConversations = conversations
    .filter(conv => conv.messages && conv.messages.length > 0) // Only show conversations with messages
    .filter(conv =>
      (conv.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by most recent first

  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const date = conv.timestamp;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let key = '';
    if (date.toDateString() === today.toDateString()) {
      key = t('today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = t('yesterday');
    } else {
      key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
        isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`} onClick={onToggle} />
      
      <div className={`border-r flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed 
          ? 'w-12' 
          : 'w-80'
      } ${
        // Mobile: fixed positioning with slide animation
        'md:relative fixed inset-y-0 left-0 z-50 md:z-auto'
      } ${
        // Mobile slide animation
        isCollapsed ? 'md:translate-x-0 -translate-x-full' : 'translate-x-0'
      } ${isDark ? 'bg-black' : 'bg-white'}`} style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        {!isCollapsed && (
          <Button
            onClick={onNewConversation}
            variant="ghost"
            size="sm"
            className={`${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'} p-2`}
          >
            <img 
              src={isDark ? "/white-icon.png" : "/Icon.png"} 
              alt="New Chat" 
              className="w-auto h-6" 
            />
          </Button>
        )}
        <Button
          onClick={onToggle}
          variant="ghost"
          size="sm"
          className={`${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'} p-2`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* New Chat Button */}
          <div className="p-3">
            <Button
              onClick={onNewConversation}
              className={`w-full flex items-center gap-2 justify-center py-2 px-4 rounded-lg border-2 ${
                isDark 
                  ? 'border-gray-600 bg-transparent text-white hover:bg-white hover:text-black' 
                  : 'border-gray-300 bg-transparent text-black hover:bg-black hover:text-white'
              }`}
              variant="ghost"
            >
              <PencilLine className="w-4 h-4" />
              <span className="text-sm font-medium">{t('new.chat')}</span>
            </Button>
          </div>

          {/* Search */}
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.conversations')}
                className={`pl-10 focus-visible:ring-0 focus:outline-none ${isDark ? 'bg-black border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(groupedConversations).map(([period, convs]) => (
              <div key={period} className="mb-4">
                <div className={`px-3 py-2 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                  {period}
                </div>
                {convs.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => editingId !== conversation.id && onSelectConversation(conversation)}
                    className={`mx-2 mb-1 p-3 rounded-lg group relative border-2 border-gray-400 hover:bg-gray-500/10 transition-colors ${
                      editingId === conversation.id ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      currentConversationId === conversation.id
                        ? isDark ? 'bg-gray-700' : 'bg-gray-100'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {editingId === conversation.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="text-sm h-6 px-1 bg-gray-600 border-gray-500 text-white"
                              style={{ fontSize: '16px' }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') handleEditSave();
                                if (e.key === 'Escape') handleEditCancel();
                              }}
                              autoFocus
                            />
                            <Button
                              onClick={handleEditSave}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 text-green-400 hover:text-green-300"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={handleEditCancel}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h4 className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
                              {conversation.title}
                            </h4>
                            <p className="text-xs truncate mt-1 text-gray-400">
                              {conversation.lastMessage}
                            </p>
                          </>
                        )}
                      </div>
                      {editingId !== conversation.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              onClick={(e) => e.stopPropagation()}
                              variant="ghost"
                              size="sm"
                              className={`p-1 h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
                                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={isDark ? 'border-gray-700' : 'bg-white border-gray-200'} style={isDark ? { backgroundColor: '#222222' } : undefined}>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onShareConversation?.(conversation.id);
                              }}
                              className={`cursor-pointer ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              {t('share')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStart(conversation);
                              }}
                              className={`cursor-pointer ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              <PencilLine className="w-4 h-4 mr-2" />
                              {t('rename')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(conversation.id);
                              }}
                              className={`cursor-pointer ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <History className="w-8 h-8 text-gray-400 mb-2" />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  {searchQuery ? t('no.conversations.found') : t('no.conversations.yet')}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {isCollapsed && (
        <div 
          className="flex flex-col items-center py-4 cursor-pointer h-full"
          onClick={onToggle}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onNewConversation();
            }}
            variant="ghost"
            size="sm"
            className={`${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'} p-2 md:block hidden mb-2`}
          >
            <PencilLine className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            }}
            variant="ghost"
            size="sm"
            className={`${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'} p-2 md:block hidden mb-2`}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'} p-2.5 md:hidden rounded-lg transition-all duration-200 active:scale-95`}
          >
            <div className="flex flex-col gap-1.5 w-5">
              <div className="h-0.5 w-full rounded-full bg-current" />
              <div className="h-0.5 w-3/4 rounded-full bg-current" />
            </div>
          </Button>
          <div className="flex-1"></div>
        </div>
      )}
    </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className={`${isDark ? 'border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-2xl max-w-sm w-full transform transition-all duration-200 scale-100`} style={{ backgroundColor: isDark ? '#222222' : undefined }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('delete.conversation.title')}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('delete.conversation.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteConfirmId(null)}
                  variant="ghost"
                  className={`flex-1 ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {t('delete')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ConversationSidebar;