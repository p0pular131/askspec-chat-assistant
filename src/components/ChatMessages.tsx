
import React, { useRef, useEffect, memo, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from './types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { fetchCompatibilityData } from '../integrations/supabase/client';
import { Check, AlertTriangle, X } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

// Helper function to detect compatibility check request in message text
const isCompatibilityCheckRequest = (text: string): boolean => {
  const compatibilityKeywords = [
    '호환성', '호환', 'compatibility', 'compatible', '맞는지', '맞나요', 
    '같이 사용', '함께 사용', '궁합', '조합'
  ];
  
  // Check if the text contains any of the compatibility keywords
  return compatibilityKeywords.some(keyword => text.toLowerCase().includes(keyword));
};

// Helper function to extract compatibility table information from message text
const extractCompatibilityTable = (text: string) => {
  // Check if this is a compatibility check message
  if (text.includes('호환성') || text.includes('compatibility')) {
    const components = [
      'CPU', 'GPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Cooling', 'Case'
    ];
    
    const compatData = {
      hasCompatInfo: false,
      entries: [] as Array<{component: string, status: string, details: string}>
    };
    
    // Look for component compatibility information
    for (const component of components) {
      const regex = new RegExp(`${component}[^:]*:[^:]*?(호환|compatible|incompatible|가능|불가능|맞음|안맞음)([^\\n]*)`, 'i');
      const match = text.match(regex);
      
      if (match) {
        compatData.hasCompatInfo = true;
        const statusText = match[1].toLowerCase();
        const isCompatible = 
          statusText.includes('호환') || 
          statusText.includes('compatible') || 
          statusText.includes('가능') || 
          statusText.includes('맞음');
        
        const status = isCompatible ? 'compatible' : 'incompatible';
        const details = match[2].trim();
        
        compatData.entries.push({
          component,
          status,
          details
        });
      }
    }
    
    return compatData;
  }
  
  return { hasCompatInfo: false, entries: [] };
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [compatibilityData, setCompatibilityData] = useState<any>(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check for compatibility requests in the messages and fetch data if needed
  useEffect(() => {
    const checkForCompatibilityRequest = async () => {
      // Only proceed if there are messages
      if (messages.length === 0) return;
      
      // Check if the last user message is asking about compatibility
      const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
      
      if (lastUserMessage && isCompatibilityCheckRequest(lastUserMessage.text)) {
        // Fetch compatibility data from Supabase
        const data = await fetchCompatibilityData();
        setCompatibilityData(data);
      }
    };
    
    checkForCompatibilityRequest();
  }, [messages]);

  return (
    <div className="flex overflow-y-auto flex-col flex-1 gap-4 mb-20">
      {messages.map((message, index) => {
        // Regular message format for user messages
        if (message.isUser) {
          return <ChatMessage key={`message-${index}-${message.text.substring(0, 10)}`} message={message} />;
        }
        
        // For AI messages, check if we need to display compatibility info
        const isLastAIMessage = !message.isUser && 
          index === messages.length - 1 && 
          messages.length > 1 && 
          messages[messages.length - 2].isUser && 
          isCompatibilityCheckRequest(messages[messages.length - 2].text);
        
        // If this is the last AI message responding to a compatibility request
        if (isLastAIMessage && compatibilityData) {
          return (
            <div key={`message-${index}-compat-table`} className="flex justify-start">
              <div className="max-w-[90%] rounded-lg p-4 bg-gray-100 text-zinc-900 rounded-tl-none">
                <div className="mb-4">
                  <p>호환성 검사 결과입니다:</p>
                </div>
                
                <div className="my-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">부품 1</TableHead>
                        <TableHead className="w-[100px]">호환성</TableHead>
                        <TableHead className="w-[120px]">부품 2</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compatibilityData.links.map((link: any, i: number) => (
                        <TableRow key={`comp-${i}`}>
                          <TableCell className="font-medium">{link.source}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              link.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : link.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {link.status === 'success' && <Check className="mr-1 h-3 w-3" />}
                              {link.status === 'warning' && <AlertTriangle className="mr-1 h-3 w-3" />}
                              {link.status === 'error' && <X className="mr-1 h-3 w-3" />}
                              {link.status === 'success' ? '호환 가능' : 
                               link.status === 'warning' ? '일부 호환' : '호환 불가'}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{link.target}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Display reasons for incompatible components */}
                <div className="mt-4 text-sm">
                  <h4 className="font-semibold mb-2">호환성 문제 세부 정보:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {compatibilityData.links
                      .filter((link: any) => link.status !== 'success' && link.reason)
                      .map((link: any, i: number) => (
                        <li key={`reason-${i}`} className={link.status === 'warning' ? 'text-yellow-700' : 'text-red-700'}>
                          <span className="font-medium">{link.source} ↔ {link.target}</span>: {link.reason}
                        </li>
                      ))}
                  </ul>
                </div>
                
                {/* Add general advice about the compatibility */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p>{message.text}</p>
                </div>
              </div>
            </div>
          );
        }
        
        // Check if the existing message contains compatibility info that should be rendered as a table
        const compatInfo = extractCompatibilityTable(message.text);
        
        if (compatInfo.hasCompatInfo) {
          return (
            <div key={`message-${index}-table`} className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
                <div className="mb-4">
                  {message.text.split('\n').slice(0, 3).join('\n')}
                  {/* Only show the first few lines before the table */}
                </div>
                
                <div className="my-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">부품</TableHead>
                        <TableHead className="w-[100px]">호환성</TableHead>
                        <TableHead>세부 정보</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compatInfo.entries.map((entry, i) => (
                        <TableRow key={`comp-${i}`}>
                          <TableCell className="font-medium">{entry.component}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              entry.status === 'compatible' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.status === 'compatible' ? '호환 가능' : '호환 불가'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{entry.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Show remaining text after the compatibility information */}
                <div className="mt-4">
                  {message.text.split('\n').slice(3 + compatInfo.entries.length).join('\n')}
                </div>
              </div>
            </div>
          );
        }
        
        // Regular message without compatibility table
        return <ChatMessage key={`message-${index}-${message.text.substring(0, 10)}`} message={message} />;
      })}
      
      {isLoading && (
        <div className="self-start max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
          <p className="text-sm">생각 중...</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default memo(ChatMessages);
