
import React, { useState, useCallback, memo } from 'react';
import { Session } from '../hooks/useConversations';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";

interface ChatConversationListProps {
  conversations: Session[];
  currentConversation: Session | null;
  loading: boolean;
  onSelect: (conversation: Session) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const ChatConversationList: React.FC<ChatConversationListProps> = ({
  conversations,
  currentConversation,
  loading,
  onSelect,
  onDelete,
  onNew
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent clicking the parent conversation item
    setConversationToDelete(id);
    setDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (conversationToDelete) {
      onDelete(conversationToDelete);
      setDialogOpen(false);
      setConversationToDelete(null);
    }
  }, [conversationToDelete, onDelete]);

  const cancelDelete = useCallback(() => {
    setConversationToDelete(null);
    setDialogOpen(false);
  }, []);

  const renderConversationsList = useCallback(() => {
    if (loading) {
      return <div className="p-2 text-sm text-center">Loading...</div>;
    }
    
    if (conversations.length === 0) {
      return <div className="p-2 text-sm text-center text-gray-500">대화 내역이 없습니다.</div>;
    }
    
    return conversations.map((convo) => (
      <div key={convo.id} className="flex items-center gap-2">
        <button
          className={`p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100 ${
            currentConversation?.id === convo.id ? 'bg-neutral-100 font-medium' : ''
          }`}
          onClick={() => onSelect(convo)}
        >
          {convo.session_name || 'Untitled conversation'}
        </button>
        <button
          onClick={(e) => handleDelete(e, String(convo.id))}
          className="p-1 text-red-500 rounded hover:bg-red-50"
          aria-label="Delete conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    ));
  }, [conversations, currentConversation, loading, onSelect, handleDelete]);

  return (
    <div className="flex flex-col gap-2">
      {/* Conversations Section */}
      <div className="flex items-center justify-between pl-2 mb-2 text-xs text-stone-500">
        <span>대화 목록</span>
        <button 
          onClick={onNew}
          className="p-1 text-xs text-white bg-askspec-purple rounded-full hover:bg-askspec-purple-dark"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>
      </div>

      {renderConversationsList()}

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 이 대화를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없으며 대화와 관련된 모든 메시지가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default memo(ChatConversationList);
