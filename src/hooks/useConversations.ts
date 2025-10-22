import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService } from '@/services/userDataService';

export interface Message {
  id: number;
  type: 'user' | 'ai' | 'greeting';
  content: string;
  timestamp: Date;
  files?: { name: string; type: string; size: number }[];
  fileContents?: { name: string; type: string; content: string }[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  chatHistory: any[];
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = () => `conversations_${user?.id || 'anonymous'}`;

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      
      if (user?.id) {
        try {
          // Load from database first
          const dbConversations = await userDataService.getConversations(user.id);
          if (dbConversations.length > 0) {
            setConversations(dbConversations);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading conversations from database:', error);
        }
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const conversationsWithDates = parsed.map((conv: any) => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
            messages: conv.messages.map((msg: any, index: number) => ({
              ...msg,
              id: Date.now() + index,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setConversations(conversationsWithDates);
        } catch (error) {
          console.error('Error parsing localStorage conversations:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setIsLoading(false);
    }
  }, [user]);

  const saveConversations = async (convs: Conversation[]) => {
    // Removed console.log to prevent user data exposure
    try {
      // Limit to 20 most recent conversations
      const limitedConvs = convs.slice(0, 20);
      
      // Limit messages per conversation to 50 most recent
      const optimizedConvs = limitedConvs.map(conv => ({
        ...conv,
        messages: conv.messages.slice(-50),
        chatHistory: conv.chatHistory.slice(-20)
      }));
      
      // Save to database if user is logged in
      if (user?.id) {
        for (const conv of optimizedConvs) {
          await userDataService.saveConversation(user.id, conv);
        }
      }
      
      localStorage.setItem(getStorageKey(), JSON.stringify(optimizedConvs));
      setConversations(optimizedConvs);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Clear old conversations and try again
        const recentConvs = convs.slice(0, 10).map(conv => ({
          ...conv,
          messages: conv.messages.slice(-20),
          chatHistory: conv.chatHistory.slice(-10)
        }));
        localStorage.setItem(getStorageKey(), JSON.stringify(recentConvs));
        setConversations(recentConvs);
      }
    }
  };

  const createNewConversation = (): Conversation => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation', // This will be replaced by the first message
      lastMessage: '',
      timestamp: new Date(),
      messages: [],
      chatHistory: []
    };
    
    // Don't save empty conversation yet - it will be saved when first message is sent
    setCurrentConversationId(newConv.id);
    return newConv;
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    // Removed console.log to prevent user data exposure
    setConversations(prevConversations => {
      const updatedConv = prevConversations.find(conv => conv.id === id);
      const updated = updatedConv 
        ? { ...updatedConv, ...updates, timestamp: new Date() }
        : { id, title: 'New Conversation', lastMessage: '', messages: [], chatHistory: [], ...updates, timestamp: new Date() } as Conversation;
      
      // Only save if conversation has messages
      if (!updated.messages || updated.messages.length === 0) {
        return prevConversations;
      }
      
      const others = prevConversations.filter(conv => conv.id !== id);
      const reordered = [updated, ...others];
      
      // Removed console.log to prevent user data exposure
      saveConversations(reordered);
      return reordered;
    });
  };

  const updateConversationTitle = (id: string, title: string) => {
    updateConversation(id, { title });
  };

  const deleteConversation = async (id: string) => {
    // Immediately update UI for instant feedback
    const updated = conversations.filter(conv => conv.id !== id);
    setConversations(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
    
    // Delete from database in background
    if (user?.id) {
      userDataService.deleteConversation(id).catch(console.error);
    }
  };

  const getCurrentConversation = useCallback((): Conversation | null => {
    return conversations.find(conv => conv.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    updateConversation,
    updateConversationTitle,
    deleteConversation,
    getCurrentConversation,
    isLoading
  };
};