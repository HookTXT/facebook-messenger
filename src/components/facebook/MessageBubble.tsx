import React from 'react';
import { Check, CheckCheck, AlertCircle } from 'lucide-react';
import { FacebookMessage } from '../../types/facebook';

interface MessageBubbleProps {
  message: FacebookMessage;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isFirstInGroup,
  isLastInGroup
}) => {
  const isMe = message.sender === 'me';
  
  // Format time from ISO string
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status icon based on message status
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return (
          <div className="animate-pulse">
            <Check className="h-3.5 w-3.5 text-gray-400" />
          </div>
        );
      case 'sent':
        return <Check className="h-3.5 w-3.5 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  // Determine message bubble styling
  const getBubbleClasses = () => {
    const baseClasses = 'py-2 px-3 max-w-[85%] inline-block rounded-lg';
    const firstClasses = isFirstInGroup ? 'mt-2' : 'mt-0.5';
    
    if (isMe) {
      return `${baseClasses} ${firstClasses} ${
        isFirstInGroup ? 'rounded-tr-none' : ''
      } bg-blue-600 text-white self-end`;
    } else {
      return `${baseClasses} ${firstClasses} ${
        isFirstInGroup ? 'rounded-tl-none' : ''
      } bg-white border border-gray-200 text-gray-800 self-start`;
    }
  };

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      {isFirstInGroup && !isMe && (
        <span className="text-xs text-gray-500 ml-2 mb-1">
          {message.senderName || 'Customer'}
        </span>
      )}
      
      <div className={getBubbleClasses()}>
        {message.content}
      </div>
      
      {isLastInGroup && (
        <div className={`flex items-center text-xs text-gray-500 mt-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
          <span>{formatTime(message.timestamp)}</span>
          {isMe && (
            <span className="ml-1">
              {getStatusIcon()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};