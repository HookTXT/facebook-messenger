import React, { useState, useEffect } from 'react';
import { ConversationList } from '../components/facebook/ConversationList';
import { MessengerChat } from '../components/facebook/MessengerChat';
import { useMessengerConversations } from '../hooks/useMessengerConversations';
import { FacebookConversation } from '../types/facebook';

/**
 * Main dashboard for managing Facebook Messenger conversations
 */
const MessengerDashboard: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<FacebookConversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const { 
    conversations,
    loadConversations,
    isLoading,
    error
  } = useMessengerConversations();

  useEffect(() => {
    loadConversations();
    
    // Set up polling for new conversations (in a real app, use webhooks)
    const intervalId = setInterval(() => {
      loadConversations(false); // silent refresh
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [loadConversations]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileView('list');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectConversation = (conversation: FacebookConversation) => {
    setSelectedConversation(conversation);
    if (window.innerWidth < 768) {
      setMobileView('chat');
    }
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List - Hidden on mobile when viewing a chat */}
        <div 
          className={`${
            mobileView === 'chat' ? 'hidden md:block' : 'block'
          } w-full md:w-80 lg:w-96 border-r bg-white overflow-y-auto`}
        >
          <ConversationList 
            conversations={conversations} 
            selectedId={selectedConversation?.id} 
            onSelectConversation={handleSelectConversation}
            isLoading={isLoading}
            error={error}
          />
        </div>
        
        {/* Chat Area - Hidden on mobile when viewing the list */}
        <div 
          className={`${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          } flex-1 flex flex-col bg-gray-50`}
        >
          {selectedConversation ? (
            <MessengerChat 
              conversation={selectedConversation}
              onBack={handleBackToList}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No Conversation Selected</h2>
              <p className="text-gray-600 max-w-md">
                Select a conversation from the list to view and respond to messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessengerDashboard;