import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// Create a wrapper component to use hooks
const ChatErrorDisplay = ({ error, onRetry }: { error?: Error, onRetry: () => void }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t('chat.error')}
      </h3>
      
      <p className="text-muted-foreground mb-4 max-w-md">
        {t('chat.error.description')}
      </p>

      <Button onClick={onRetry} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        {t('retry.chat')}
      </Button>
    </div>
  );
};

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ChatErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return <ChatErrorDisplay error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;
