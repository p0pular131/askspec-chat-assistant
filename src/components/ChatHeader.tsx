
import React from 'react';

interface ChatHeaderProps {
  selectedExpertiseLevel?: string | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedExpertiseLevel = null }) => {
  return (
    <header className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-normal text-zinc-900">
          AskSpec
          <span className="block text-lg font-medium">
            컴퓨터 견적 추천 서비스
          </span>
        </h1>
      </div>
      
      {selectedExpertiseLevel && (
        <div className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
          응답 형식: {
            selectedExpertiseLevel === 'expert' ? '전문가' :
            selectedExpertiseLevel === 'intermediate' ? '중급자' :
            selectedExpertiseLevel === 'beginner' ? '입문자' :
            '선택되지 않음'
          }
        </div>
      )}
      
      {!selectedExpertiseLevel && (
        <div className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
          응답 형식: 선택되지 않음
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
