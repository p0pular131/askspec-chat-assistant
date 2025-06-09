
import React from 'react';
import { SurveyOption } from './SurveyOption';

interface ExpertiseSurveyProps {
  selectedAnswer: number | null;
  onSelectAnswer: (id: number) => void;
}

const ExpertiseSurvey: React.FC<ExpertiseSurveyProps> = ({ 
  selectedAnswer, 
  onSelectAnswer 
}) => {
  return (
    <div className="mb-8">
      <h2 className="mb-2 text-base font-medium text-zinc-900">
        본인에게 적절하다고 느끼는 설명을 선택해주세요.
      </h2>
      <p className="mb-6 text-sm text-stone-500">
        해당 설문은 AskSpec의 응답 형식에 반영됩니다.
      </p>
      <div className="flex flex-col gap-4">
        <SurveyOption
          id={1}
          title="입문자"
          description="예시: 영상이 끊기지 않고 부드럽게 재생되도록 도와주는 그래픽카드예요"
          isSelected={selectedAnswer === 1}
          onSelect={() => onSelectAnswer(1)}
        />
        <SurveyOption
          id={2}
          title="중급자"
          description="예시: RTX 4060은 8GB의 메모리를 보유하고 있으며, 영상 편집과 간단한 게임 모두에 적합한 중급형 그래픽카드입니다."
          isSelected={selectedAnswer === 2}
          onSelect={() => onSelectAnswer(2)}
        />
        <SurveyOption
          id={3}
          title="전문가"
          description="예시: RTX 4060 (AD107 기반)는 DLSS 3와 4세대 NVENC를 지원해 영상 인코딩/AI 워크플로우에 최적입니다."
          isSelected={selectedAnswer === 3}
          onSelect={() => onSelectAnswer(3)}
        />
      </div>
    </div>
  );
};

export default ExpertiseSurvey;
