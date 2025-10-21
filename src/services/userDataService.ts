import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/hooks/useConversations';

// Sanitize log output to prevent log injection
const sanitizeLog = (data: any): string => {
  if (typeof data === 'string') {
    return data.replace(/[\r\n]/g, ' ').substring(0, 100);
  }
  return JSON.stringify(data).replace(/[\r\n]/g, ' ').substring(0, 100);
};

export interface UserProfile {
  id: string;
  name: string | null;
  photo: string | null;
  goals: string | null;
  language: string | null;
}

export const userDataService = {
  // User Profile Methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) return null;
      return data;
    } catch (error) {
      return null;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating user profile');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Database not available, using localStorage only');
      return false;
    }
  },

  // Conversations Methods
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error || !data) return [];
      
      return data.map(conv => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.last_message || '',
        timestamp: new Date(conv.updated_at),
        messages: Array.isArray(conv.messages) ? conv.messages : [],
        chatHistory: Array.isArray(conv.chat_history) ? conv.chat_history : []
      }));
    } catch (error) {
      return [];
    }
  },

  async saveConversation(userId: string, conversation: Conversation): Promise<boolean> {
    try {
      // Generate UUID if conversation ID is a timestamp
      let conversationId = conversation.id;
      if (/^\d+$/.test(conversationId)) {
        conversationId = crypto.randomUUID();
      }
      
      const { error } = await supabase
        .from('conversations')
        .upsert({
          id: conversationId,
          user_id: userId,
          title: conversation.title,
          last_message: conversation.lastMessage,
          messages: conversation.messages,
          chat_history: conversation.chatHistory,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error saving conversation');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Database not available, using localStorage only');
      return false;
    }
  },

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) {
        console.error('Error deleting conversation');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Database not available, using localStorage only');
      return false;
    }
  },

  // Language Methods
  async updateLanguagePreference(userId: string, language: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          language,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating language preference');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Database not available for language sync');
      return false;
    }
  },

  async getLanguagePreference(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('language')
        .eq('id', userId)
        .single();
      
      if (error) {
        return null;
      }
      
      if (!data || !data.language) {
        return null;
      }
      return data.language;
    } catch (error) {
      console.error('Exception getting language preference');
      return null;
    }
  },

  // Sync Methods
  async syncUserData(userId: string) {
    // Sync profile data from localStorage to database
    const name = localStorage.getItem('userName');
    const photo = localStorage.getItem('userPhoto');
    const goals = localStorage.getItem('userGoals');
    const language = localStorage.getItem('userLanguage');
    
    if (name || photo || goals || language) {
      await this.updateUserProfile(userId, {
        name: name || undefined,
        photo: photo || undefined,
        goals: goals || undefined,
        language: language || undefined
      });
    }
  },

  async loadUserData(userId: string) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const profile = await Promise.race([
        this.getUserProfile(userId),
        timeoutPromise
      ]) as UserProfile | null;
      
      if (profile) {
        if (profile.name) {
          localStorage.setItem('userName', profile.name);
          window.dispatchEvent(new CustomEvent('nameUpdated', { detail: { name: profile.name } }));
        }
        if (profile.photo) localStorage.setItem('userPhoto', profile.photo);
        if (profile.goals) localStorage.setItem('userGoals', profile.goals);
        
        // Handle language preference with validation
        if (profile.language && ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'].includes(profile.language)) {
          const currentLanguage = localStorage.getItem('userLanguage');
          if (currentLanguage !== profile.language) {
            localStorage.setItem('userLanguage', profile.language);
            window.dispatchEvent(new CustomEvent('languageUpdated', { detail: { language: profile.language } }));
          }
        }
        
        window.dispatchEvent(new CustomEvent('profileLoaded'));
      }
    } catch (error) {
      // Silently continue without database data
    }
  }
};