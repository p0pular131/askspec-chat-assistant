
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import ChatLayout from '../components/ChatLayout';
import { useConversationState } from '../hooks/useConversationState';

const Index = () => {
  const conversationState = useConversationState();

  return (
    <>
      <ChatLayout 
        {...conversationState}
        sessionId={conversationState.sessionId} // sessionId 전달
      />
      <Toaster />
    </>
  );
};

export default Index;
