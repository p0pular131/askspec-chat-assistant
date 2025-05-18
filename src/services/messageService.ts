
import { supabase } from '../integrations/supabase/client';
import { DatabaseMessage } from '../types/messages';
import { responseModules } from '../modules/responseModules';

type MessageRow = { id: number };
// Helper function to get the next available ID for a table
async function getNextId(tableName: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('id')
      .order('id', { ascending: false })
      .limit(1) as unknown as { data: MessageRow[] | null, error: any };
      
    if (error) {
      console.error(`Error getting max ID for ${tableName}:`, error);
      return Date.now(); // Fallback to timestamp if query fails
    }
    
    // Add proper type checking to ensure id is a number before adding 1
    if (data && data.length > 0 && typeof data[0].id === 'number') {
      return data[0].id + 1;
    } else {
      return 1; // Start with 1 if no records found or id is not a number
    }
  } catch (error) {
    console.error(`Error in getNextId for ${tableName}:`, error);
    return Date.now(); // Fallback to timestamp
  }
}

// Load messages for a specific session
export async function loadMessagesForSession(sessionId: string): Promise<DatabaseMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', parseInt(sessionId, 10)) // Convert string sessionId to number
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
    const typedData = data as DatabaseMessage[];
    
    // Find the chat mode for each message from response_json if possible
    const enhancedData = typedData.map(message => {
      let chatMode = '범용 검색'; // Default mode
      
      // Try to extract chat mode from response_json
      if (message.response_json) {
        try {
          const jsonData = JSON.parse(message.response_json);
          if (jsonData && jsonData.chat_mode) {
            chatMode = jsonData.chat_mode;
          }
        } catch (e) {
          // If parsing fails, use default mode
          console.warn('Failed to parse response_json for chat mode');
        }
      }
      
      return {
        ...message,
        role: message.role === 'user' || message.role === 'assistant' ? message.role : 'user',
        chat_mode: chatMode
      };
    });
    
    return enhancedData;
  } catch (error) {
    console.error('Error in loadMessagesForSession:', error);
    throw error;
  }
}

// Add a new message to the database
export async function addMessageToDatabase(
  content: string, 
  role: 'user' | 'assistant', 
  sessionId: string,
  chatMode: string = '범용 검색'
): Promise<DatabaseMessage | null> {
  try {
    // Get the next message ID
    const nextMessageId = await getNextId('messages');
    
    // Create response_json with chat mode for proper rendering on reload
    const responseJson = JSON.stringify({ chat_mode: chatMode });
    
    // Add the message directly to the database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: nextMessageId,
        input_text: content,
        role: role,
        session_id: parseInt(sessionId, 10),
        response_json: responseJson // Store chat mode in response_json
      })
      .select();
    
    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned when adding message');
      throw new Error('Failed to add message');
    }
    
    // Return the message with chat mode
    const message = data[0];
    return {
      ...message,
      role: message.role === 'user' || message.role === 'assistant' ? message.role : 'user',
      chat_mode: chatMode
    } as DatabaseMessage;
  } catch (error) {
    console.error('Error in addMessageToDatabase:', error);
    throw error;
  }
}

// Process a message using the appropriate module based on chat mode
export async function processMessage(
  messages: { role: string; content: string }[],
  chatMode: string = '범용 검색',
  sessionId: string | null = null,
  expertiseLevel: string = 'intermediate'
): Promise<string> {
  try {
    // Find the last user message using a traditional for loop instead of findLast
    let lastUserMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i].content;
        break;
      }
    }

    // If no user message was found, use an empty string
    if (!lastUserMessage) {
      lastUserMessage = '';
    }
    
    // Use the appropriate module based on chat mode
    if (responseModules[chatMode]) {
      // Get response from the corresponding module using sample data
      return await responseModules[chatMode].process(lastUserMessage, expertiseLevel);
    }
    
    // Fallback to general search module
    return await responseModules['범용 검색'].process(lastUserMessage, expertiseLevel);
  } catch (error) {
    console.error('Error in processMessage:', error);
    
    // Return a fallback sample response
    return generateMockResponse(messages.length > 0 ? messages[messages.length - 1].content : '', chatMode);
  }
}

// Helper function to generate mock responses based on chat mode
function generateMockResponse(userMessage: string, chatMode: string): string {
  // Default response for all chat modes
  const defaultResponse = "죄송합니다. 현재 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
  
  // Generate different responses based on chat mode
  switch(chatMode) {
    case '호환성 검사':
      return `호환성 검사 결과: 문제 없습니다. ${userMessage}에 언급된 부품들은 모두 호환됩니다.`;
      
    case '견적 추천':
      return `다음과 같은 PC 견적을 추천합니다:\n\nCPU: AMD Ryzen 7 5800X\nGPU: NVIDIA RTX 3070\nRAM: 16GB DDR4 3200MHz\nSSD: Samsung 970 EVO Plus 1TB\n\n총 가격: ₩1,500,000`;
      
    case '부품 추천':
      return `${userMessage}에 대한 부품 추천:\n\nCPU: Intel i5-12600K\nGPU: RTX 3060 Ti\nRAM: 32GB DDR4\n\n이 부품들은 요구하신 용도에 가장 적합합니다.`;
      
    case '스펙 업그레이드':
      return `업그레이드 추천:\n\n1. GPU를 RTX 3070으로 업그레이드하세요.\n2. RAM을 32GB로 늘리세요.\n3. NVMe SSD를 추가하세요.\n\n이 업그레이드로 성능이 크게 향상될 것입니다.`;
      
    case '견적 평가':
      return `견적 평가:\n\n가성비: 4.5/5\n성능: 4.2/5\n호환성: 5/5\n\n전반적으로 균형 잡힌 구성입니다. GPU와 CPU의 조합이 매우 좋습니다.`;
      
    case '범용 검색':
    default:
      return `${userMessage}에 대한 답변입니다. 컴퓨터 하드웨어는 매우 다양한 종류가 있으며, 용도에 따라 적합한 부품이 달라집니다.`;
  }
}
