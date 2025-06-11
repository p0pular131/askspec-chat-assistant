
import { useMemo } from 'react';

interface MessageSequence {
  timeRange: [number, number] | [number, 'infinite'];
  message: string;
  interval?: number; // For repeating messages
}

interface MessageWithStatus {
  message: string;
  status: 'completed' | 'current' | 'pending';
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
    { timeRange: [35, 115], message: '부품을 조합하며 견적을 제작하고 있어요.' },
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
    { timeRange: [58, 75], message: '업그레이드 부품을 찾고 있어요.' },
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

export function useDynamicWaitingMessage(chatMode: string = '범용 검색', elapsedTime: number = 0) {
  // Get the appropriate message sequence for the current chat mode
  const getMessageSequence = (mode: string): MessageSequence[] => {
    return waitingMessageSequences[mode] || defaultSequence;
  };

  // Get all messages with their status based on elapsed time
  const getMessagesWithStatus = (elapsed: number, sequence: MessageSequence[]): MessageWithStatus[] => {
    console.log(`[메시지 상태 계산] 모드: ${chatMode}, 경과시간: ${elapsed}초`);
    
    // Sort sequence by start time to ensure correct order
    const sortedSequence = [...sequence].sort((a, b) => a.timeRange[0] - b.timeRange[0]);
    
    const messagesWithStatus: MessageWithStatus[] = [];
    
    for (const item of sortedSequence) {
      const [start, end] = item.timeRange;
      let status: 'completed' | 'current' | 'pending';
      
      if (end === 'infinite') {
        if (elapsed >= start) {
          status = 'current';
        } else {
          status = 'pending';
        }
      } else {
        if (elapsed >= end) {
          status = 'completed';
        } else if (elapsed >= start) {
          status = 'current';
        } else {
          status = 'pending';
        }
      }
      
      // Only include messages that are current or completed
      if (status === 'current' || status === 'completed') {
        messagesWithStatus.push({
          message: item.message,
          status
        });
      }
    }
    
    console.log(`[메시지 상태] 총 ${messagesWithStatus.length}개 메시지:`, messagesWithStatus);
    return messagesWithStatus;
  };

  const messagesWithStatus = useMemo(() => {
    const sequence = getMessageSequence(chatMode);
    return getMessagesWithStatus(elapsedTime, sequence);
  }, [chatMode, elapsedTime]);

  // Get current message for backward compatibility
  const currentMessage = useMemo(() => {
    const currentMsg = messagesWithStatus.find(msg => msg.status === 'current');
    return currentMsg?.message || '답변을 생성하고 있습니다...';
  }, [messagesWithStatus]);

  return {
    currentMessage,
    messagesWithStatus
  };
}
