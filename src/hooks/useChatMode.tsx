
import { useState, useCallback } from 'react';

export function useChatMode() {
  const [chatMode, setChatMode] = useState('범용 검색');

  const getExamplePrompt = useCallback(() => {
    const examples = {
      '범용 검색': "게이밍용 컴퓨터 견적 추천해주세요. 예산은 150만원 정도입니다.",
      '부품 추천': "게이밍에 적합한 그래픽카드 추천해주세요.",
      '견적 추천': "영상 편집용 컴퓨터 견적을 만들어주세요. 4K 영상 작업이 필요합니다.",
      '호환성 검사': "인텔 13세대 CPU와 B660 메인보드가 호환되나요?",
      '스펙 업그레이드': "현재 i5-10400, GTX 1660 사용 중인데 업그레이드할 부품을 추천해주세요.",
      '견적 평가': "RTX 4060, i5-13400F, 16GB RAM, 1TB SSD로 구성된 견적 어떤가요?",
    };
    return examples[chatMode as keyof typeof examples] || examples["범용 검색"];
  }, [chatMode]);

  return {
    chatMode,
    setChatMode,
    getExamplePrompt
  };
}
