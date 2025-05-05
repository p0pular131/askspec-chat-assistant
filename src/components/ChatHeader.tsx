
import React from 'react';

const ChatHeader: React.FC = () => {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-normal text-zinc-900">
        AskSpec
        <span className="block text-lg font-medium">
          컴퓨터 견적 추천 서비스
        </span>
      </h1>
    </header>
  );
};

export default ChatHeader;
