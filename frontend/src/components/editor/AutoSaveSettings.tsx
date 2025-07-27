'use client';

import React, { useState } from 'react';
import { Settings, Save, Clock, RotateCcw, Check } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AutoSaveSettingsProps {
  className?: string;
}

export const AutoSaveSettings: React.FC<AutoSaveSettingsProps> = ({ className }) => {
  const {
    autoSaveEnabled,
    autoSaveInterval,
    hasUnsavedChanges,
    lastSaved,
    enableAutoSave,
    disableAutoSave,
    setAutoSaveInterval,
    triggerAutoSave,
    saveDiagram,
  } = useEditorStore();

  const [isManualSaving, setIsManualSaving] = useState(false);

  const intervalOptions = [
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '2 minutes', value: 120000 },
    { label: '5 minutes', value: 300000 },
  ];

  const handleToggleAutoSave = () => {
    if (autoSaveEnabled) {
      disableAutoSave();
    } else {
      enableAutoSave();
    }
  };

  const handleManualSave = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsManualSaving(true);
    try {
      await saveDiagram();
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsManualSaving(false);
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never saved';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Saved just now';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Saved ${hours}h ago`;
    return `Saved on ${date.toLocaleDateString()}`;
  };

  const getCurrentIntervalLabel = () => {
    const option = intervalOptions.find(opt => opt.value === autoSaveInterval);
    return option?.label || 'Custom';
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Manual Save Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleManualSave}
        disabled={!hasUnsavedChanges || isManualSaving}
        className={cn(
          'flex items-center space-x-1',
          hasUnsavedChanges && 'border-orange-500 text-orange-600'
        )}
      >
        {isManualSaving ? (
          <RotateCcw className="h-3 w-3 animate-spin" />
        ) : (
          <Save className="h-3 w-3" />
        )}
        <span className="text-xs">
          {isManualSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
        </span>
      </Button>

      {/* Auto-save Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
            <Settings className="h-3 w-3" />
            <span className="text-xs">Auto-save</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Header */}
          <div className="px-2 py-1.5 text-sm font-semibold">Auto-save Settings</div>
          <div className="h-px bg-border my-1" />
          
          {/* Auto-save Toggle */}
          <DropdownMenuItem onClick={handleToggleAutoSave}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Enable Auto-save</span>
              </div>
              {autoSaveEnabled && <Check className="h-4 w-4 text-green-600" />}
            </div>
          </DropdownMenuItem>
          
          <div className="h-px bg-border my-1" />
          
          {/* Interval Header */}
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Save Interval: {getCurrentIntervalLabel()}
          </div>
          
          {/* Interval Options */}
          {intervalOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setAutoSaveInterval(option.value)}
              className={cn(
                'text-sm',
                autoSaveInterval === option.value && 'bg-accent'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>{option.label}</span>
                </div>
                {autoSaveInterval === option.value && (
                  <Check className="h-3 w-3 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          
          <div className="h-px bg-border my-1" />
          
          {/* Status Info */}
          <div className="px-2 py-1">
            <p className="text-xs text-muted-foreground">
              {formatLastSaved(lastSaved)}
            </p>
            {hasUnsavedChanges && (
              <p className="text-xs text-orange-600 mt-1">
                ● Unsaved changes
              </p>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AutoSaveSettings;