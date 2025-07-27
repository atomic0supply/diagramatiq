'use client';

import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface ThreePanelLayoutProps {
  diagramPanel: React.ReactNode;
  editorPanel: React.ReactNode;
  chatPanel: React.ReactNode;
  className?: string;
}

/**
 * Layout de 3 paneles redimensionables:
 * - Top: Diagram (izq) + Editor (der)
 * - Bottom: AI Chat
 */
export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  diagramPanel,
  editorPanel,
  chatPanel,
  className,
}) => {
  return (
    <div className={cn('flex-1 flex flex-col h-full', className)}>
      <PanelGroup direction="vertical" className="flex-1">
        {/* Top Panel: Diagram + Editor */}
        <Panel defaultSize={70} minSize={30}>
          <PanelGroup direction="horizontal">
            {/* Diagram Panel */}
            <Panel defaultSize={50} minSize={25}>
              <div className="h-full bg-background border-r border-border">
                {diagramPanel}
              </div>
            </Panel>
            
            {/* Resize Handle */}
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
            
            {/* Editor Panel */}
            <Panel defaultSize={50} minSize={25}>
              <div className="h-full bg-background">
                {editorPanel}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        
        {/* Resize Handle */}
        <PanelResizeHandle className="h-1 bg-border hover:bg-primary/20 transition-colors" />
        
        {/* Bottom Panel: AI Chat */}
        <Panel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full bg-background border-t border-border">
            {chatPanel}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ThreePanelLayout;