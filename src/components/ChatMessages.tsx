
import React, { useRef, useEffect, memo } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from './types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

// Helper function to detect compatibility table information in message text
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
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex overflow-y-auto flex-col flex-1 gap-4 mb-20">
      {messages.map((message, index) => {
        // Check if this message contains compatibility info that should be rendered as a table
        const compatInfo = !message.isUser ? extractCompatibilityTable(message.text) : { hasCompatInfo: false, entries: [] };
        
        if (compatInfo.hasCompatInfo) {
          return (
            <div key={`message-${index}-table`} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${message.isUser ? 'bg-blue-100 text-zinc-900 rounded-br-none' : 'bg-gray-100 text-zinc-900 rounded-tl-none'}`}>
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
