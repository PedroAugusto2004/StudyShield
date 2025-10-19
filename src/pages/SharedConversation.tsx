import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bot, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/hooks/useConversations";

interface SharedConversationData {
  title: string;
  messages: Message[];
  ownerName: string;
}

export const SharedConversation = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<SharedConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = actualTheme === 'dark';

  useEffect(() => {
    const loadSharedConversation = async () => {
      if (!user) {
        setError("Please log in to view shared conversations");
        setLoading(false);
        return;
      }

      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error: fetchError } = await supabase
          .from('conversations')
          .select('title, messages, user_id')
          .eq('share_id', shareId)
          .eq('is_shared', true)
          .single();

        if (fetchError || !data) {
          setError("Conversation not found or no longer shared");
          setLoading(false);
          return;
        }

        // Get owner name
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('id', data.user_id)
          .single();

        setConversation({
          title: data.title,
          messages: data.messages as Message[],
          ownerName: profileData?.name || 'Anonymous'
        });
      } catch (err) {
        console.error('Error loading shared conversation:', err);
        setError("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    loadSharedConversation();
  }, [shareId, user]);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Login Required
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Please log in to view this shared conversation
          </p>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {error || "Conversation not found"}
          </h2>
          <Button onClick={() => navigate('/chat')}>
            Go to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/chat')}
            className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Chat
          </Button>
        </div>

        <div className={`rounded-lg p-6 mb-4 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {conversation.title}
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Shared by {conversation.ownerName}
          </p>
        </div>

        <div className="space-y-4">
          {conversation.messages.filter(msg => msg.type !== 'greeting').map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-100'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              {message.type === 'user' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}>
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
