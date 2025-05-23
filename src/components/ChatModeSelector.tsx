
import React from 'react';

interface ChatModeSelectorProps {
  chatMode: string;
  setChatMode: (mode: string) => void;
}

const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({ chatMode, setChatMode }) => {
  const modes = ['범용 검색', '부품 추천', '견적 추천', '호환성 검사', '스펙 업그레이드', '견적 평가'];
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => setChatMode(mode)}
          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
            chatMode === mode
              ? 'bg-askspec-purple text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
};

export default ChatModeSelector;
