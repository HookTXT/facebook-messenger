import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { FacebookConversation, FacebookMessage } from '../../types/facebook';
import { MessageBubble } from './MessageBubble';
import { sendMessage, markAsRead } from '../../services/facebookService';
import { useMessengerMessages } from '../../hooks/useMessengerMessages';

interface MessengerChatProps {
  conversation: FacebookConversation;
  onBack: () => void;
}

export const MessengerChat: React.FC<MessengerChatProps> = ({ 
  conversation, 
  onBack 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isLoading, 
    error, 
    loadMessages,
    addMessage
  } = useMessengerMessages(conversation.id);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Mark conversation as read
    if (!conversation.read) {
      markAsRead(conversation.id)
        .catch(err => console.error('Failed to mark as read:', err));
    }
  }, [conversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage: FacebookMessage = {
      id: tempId,
      conversationId: conversation.id,
      sender: 'me',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    try {
      setSending(true);
      
      // Add message to UI immediately with "sending" status
      addMessage(tempMessage);
      setNewMessage('');
      
      // Send message via API
      const sentMessage = await sendMessage(
        conversation.pageId,
        conversation.participant.id,
        newMessage
      );
      
      // Replace temp message with actual message
      addMessage({
        ...sentMessage,
        status: 'sent',
        tempId
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to error
      addMessage({
        ...tempMessage,
        status: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-3 border-b bg-white">
        <button
          onClick={onBack}
          className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <img
          src={conversation.participant.profilePic || 'https://via.placeholder.com/40'}
          alt={conversation.participant.name}
          className="h-10 w-10 rounded-full object-cover mr-3"
        />
        
        <div>
          <h3 className="font-medium">{conversation.participant.name}</h3>
          <div className="flex items-center">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
            <span className="text-xs text-gray-500">Active Now</span>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center my-6">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-center">
            <p>Failed to load messages. Please try again.</p>
            <button 
              onClick={() => loadMessages()}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center my-8 text-gray-500">
            <p>No messages yet. Send the first message!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFirstInGroup={
                index === 0 || 
                messages[index - 1].sender !== message.sender
              }
              isLastInGroup={
                index === messages.length - 1 || 
                messages[index + 1].sender !== message.sender
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full py-2 px-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-full transition-colors ${
              !newMessage.trim() || sending
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};