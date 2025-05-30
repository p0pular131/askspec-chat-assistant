
import React from 'react';
import ChatConversationList from './ChatConversationList';
import { Session } from '../types/sessionTypes';

interface SidebarProps {
  conversations: Session[];
  currentConversation: Session | null;
  loading: boolean;
  updatingSessionId?: number | null;
  onSelectConversation: (conversation: Session) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversation,
  loading,
  updatingSessionId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-askspec-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AS</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Ask Spec</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <ChatConversationList
          conversations={conversations}
          currentConversation={currentConversation}
          loading={loading}
          updatingSessionId={updatingSessionId}
          onSelect={onSelectConversation}
          onDelete={onDeleteConversation}
          onNew={onNewConversation}
        />
      </div>
    </div>
  );
};

export default Sidebar;
