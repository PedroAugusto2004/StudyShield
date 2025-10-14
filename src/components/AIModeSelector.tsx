import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Wifi, WifiOff, Shield, Globe, Info } from 'lucide-react';
import { aiService, AIMode } from '../services/aiService';

interface AIModeStatus {
  online: boolean;
  nanoAvailable: boolean;
  currentMode: AIMode;
  availableModes: AIMode[];
}

interface AIModeInfo {
  icon: React.ReactNode;
  label: string;
  description: string;
  privacy: string;
  color: string;
}

const MODE_INFO: Record<AIMode, AIModeInfo> = {
  online: {
    icon: <Globe className="h-4 w-4" />,
    label: 'Online Mode',
    description: 'Full AI capabilities with Gemini 2.5 Flash',
    privacy: 'Data processed by Google AI',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  offline: {
    icon: <WifiOff className="h-4 w-4" />,
    label: 'Offline Mode',
    description: 'Local AI with Gemini Nano',
    privacy: 'All data stays on your device',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  guest: {
    icon: <Shield className="h-4 w-4" />,
    label: 'Guest Mode',
    description: 'Local AI with no data storage',
    privacy: 'No data saved or transmitted',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
};

interface AIModeSelector {
  onModeChange?: (mode: AIMode) => void;
  compact?: boolean;
}

export const AIModeSelector: React.FC<AIModeSelector> = ({ onModeChange, compact = false }) => {
  const [status, setStatus] = useState<AIModeStatus>({
    online: false,
    nanoAvailable: false,
    currentMode: 'online',
    availableModes: []
  });
  const [selectedMode, setSelectedMode] = useState<AIMode>('online');
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    updateStatus();
    
    // Listen for network changes
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStatus = () => {
    const currentStatus = aiService.getStatus();
    setStatus(currentStatus);
    setSelectedMode(currentStatus.currentMode);
  };

  const handleModeChange = async (mode: AIMode) => {
    if (mode === 'offline' || mode === 'guest') {
      if (!status.nanoAvailable) {
        setIsInitializing(true);
        try {
          const success = await aiService.initializeNano();
          if (!success) {
            alert('Gemini Nano is not available. Please enable experimental AI features in Chrome.');
            return;
          }
        } catch (error) {
          alert('Failed to initialize offline AI. Please try again.');
          return;
        } finally {
          setIsInitializing(false);
        }
      }
    }

    aiService.setConfig({ preferredMode: mode });
    setSelectedMode(mode);
    updateStatus();
    onModeChange?.(mode);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedMode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {status.availableModes.map(mode => (
              <SelectItem key={mode} value={mode}>
                <div className="flex items-center gap-2">
                  {MODE_INFO[mode].icon}
                  <span className="text-xs">{MODE_INFO[mode].label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge className={MODE_INFO[selectedMode].color}>
          {MODE_INFO[selectedMode].icon}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          AI Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {(['online', 'offline', 'guest'] as AIMode[]).map(mode => {
            const info = MODE_INFO[mode];
            const isAvailable = status.availableModes.includes(mode);
            const isCurrent = selectedMode === mode;
            
            return (
              <Button
                key={mode}
                variant={isCurrent ? "default" : "outline"}
                className="w-full justify-start h-auto p-3"
                disabled={!isAvailable || isInitializing}
                onClick={() => handleModeChange(mode)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {info.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{info.label}</div>
                    <div className="text-xs opacity-70 mt-1">{info.description}</div>
                    <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {info.privacy}
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge className={info.color}>
                      Active
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {isInitializing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            Initializing offline AI...
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.online ? 'bg-green-500' : 'bg-red-500'}`} />
            Network: {status.online ? 'Connected' : 'Offline'}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.nanoAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
            Gemini Nano: {status.nanoAvailable ? 'Available' : 'Not Available'}
          </div>
        </div>

        {!status.nanoAvailable && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <div className="font-medium mb-1">Enable Offline AI</div>
                <div>
                  To use offline mode, enable "Experimental AI features" in Chrome settings 
                  (chrome://settings/ai) and restart your browser.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};