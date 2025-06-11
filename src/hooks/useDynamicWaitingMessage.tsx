
import { useState, useEffect } from 'react';

interface MessageSequence {
  timeRange: [number, number] | [number, 'infinite'];
  message: string;
  interval?: number; // For repeating messages
}

const waitingMessageSequences: Record<string, MessageSequence[]> = {
  '부품 추천': [
    { timeRange: [0, 2], message: '사용자의 요청을 분석 중이에요.' },
    { timeRange: [2, 4], message: '사용자 요청에 꼭 맞는 부품을 찾고 있어요.' },
    { timeRange: [4, 13], message: '사용자 요청에 딱 맞는 부품을 선택하고 있어요.' },
    { timeRange: [13, 'infinite'], message: '부품 검색이 완료되었어요. 잠시만 기다려주세요.' }
  ],
  '견적 추천': [
    { timeRange: [0, 5], message: '사용자의 요청을 받아 견적 제작을 준비하는 중이에요.' },
    { timeRange: [5, 35], message: '견적 제작을 위해 사용자의 요청을 세심하게 분석하고 있어요.' },
    { timeRange: [35, 115], message: '부품을 조합하며 견적을 제작하고 있어요.', interval: 10 },
    { timeRange: [115, 125], message: '제작한 견적을 분석하고 있어요.' },
    { timeRange: [125, 'infinite'], message: '견적 제작이 완료되었어요. 잠시만 기다려주세요.' }
  ],
  '호환성 검사': [
    { timeRange: [0, 3], message: '사용자의 요청을 받아 호환성 검사를 준비하는 중이에요.' },
    { timeRange: [3, 40], message: '사용자가 입력한 부품에 대한 정보를 꼼꼼하게 파악하는 중이에요.' },
    { timeRange: [40, 45], message: '견적이 호환이 되는 지 검사 항목에 따라 확인하고 있어요.' },
    { timeRange: [45, 55], message: '견적에 문제가 없는 지 한 번 더 확인하고 있어요.' },
    { timeRange: [55, 'infinite'], message: '호환성 검사가 완료되었어요. 잠시만 기다려주세요.' }
  ],
  '스펙 업그레이드': [
    { timeRange: [0, 2], message: '사용자의 요청을 받아 견적 업그레이드를 준비하는 중이에요.' },
    { timeRange: [2, 26], message: '사용자가 입력한 부품에 대한 정보를 꼼꼼하게 파악하는 중이에요.' },
    { timeRange: [26, 58], message: '견적 제작을 위해 업그레이드 대상 부품을 선정하는 중이에요.' },
    { timeRange: [58, 75], message: '업그레이드 부품을 찾고 있어요.', interval: 7 },
    { timeRange: [75, 'infinite'], message: '견적 업그레이드가 완료되었어요. 잠시만 기다려주세요.' }
  ],
  '견적 평가': [
    { timeRange: [0, 4], message: '사용자의 요청을 받아 견적 평가를 준비하는 중이에요.' },
    { timeRange: [4, 36], message: '사용자가 입력한 부품에 대한 정보를 꼼꼼하게 파악하는 중이에요.' },
    { timeRange: [36, 43], message: '견적을 평가하고 있어요.' },
    { timeRange: [43, 'infinite'], message: '견적 평가가 완료되었어요. 잠시만 기다려주세요.' }
  ]
};

// Default message sequence for modes not explicitly defined
const defaultSequence: MessageSequence[] = [
  { timeRange: [0, 'infinite'], message: '답변을 생성하고 있습니다...' }
];

export function useDynamicWaitingMessage(chatMode: string = '범용 검색') {
  const [currentMessage, setCurrentMessage] = useState('답변을 생성하고 있습니다...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Start timing when the hook is first used
  const startWaiting = () => {
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
  };

  // Stop timing and reset
  const stopWaiting = () => {
    setStartTime(null);
    setElapsedTime(0);
  };

  // Get the appropriate message sequence for the current chat mode
  const getMessageSequence = (mode: string): MessageSequence[] => {
    return waitingMessageSequences[mode] || defaultSequence;
  };

  // Find the current message based on elapsed time
  const getCurrentMessage = (elapsed: number, sequence: MessageSequence[]): string => {
    for (const item of sequence) {
      const [start, end] = item.timeRange;
      if (end === 'infinite') {
        if (elapsed >= start) {
          return item.message;
        }
      } else {
        if (elapsed >= start && elapsed < end) {
          return item.message;
        }
      }
    }
    return sequence[sequence.length - 1]?.message || '답변을 생성하고 있습니다...';
  };

  // Update elapsed time and current message
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      
      const sequence = getMessageSequence(chatMode);
      const message = getCurrentMessage(elapsed, sequence);
      setCurrentMessage(message);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, chatMode]);

  // Initialize message when chat mode changes
  useEffect(() => {
    if (startTime) {
      const sequence = getMessageSequence(chatMode);
      const message = getCurrentMessage(elapsedTime, sequence);
      setCurrentMessage(message);
    }
  }, [chatMode, elapsedTime, startTime]);

  return {
    currentMessage,
    elapsedTime,
    startWaiting,
    stopWaiting
  };
}
