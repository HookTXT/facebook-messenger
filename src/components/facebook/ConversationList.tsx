import React from 'react';
import { Search, MessageSquareMore } from 'lucide-react';
import { FacebookConversation } from '../../types/facebook';

interface ConversationListProps {
  conversations: FacebookConversation[];
  selectedId: string | undefined;
  onSelectConversation: (conversation: FacebookConversation) => void;
  isLoading: boolean;
  error: string | null;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  isLoading,
  error
}) => {
  // Format timestamp to readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled
          />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="animate-pulse flex p-3 rounded-lg">
              <div className="rounded-full bg-gray-200 h-12 w-12 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-14 flex flex-col items-end">
                <div className="h-3 bg-gray-200 rounded w-10 mb-2"></div>
                <div className="h-4 w-4 rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
          <p className="font-medium">Error loading conversations</p>
          <p className="text-sm">{error}</p>
        </div>
        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
          Try Again
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquareMore className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-medium mb-1">No conversations yet</h3>
          <p className="text-sm text-gray-600">
            When customers message your Page, conversations will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="space-y-1">
        {conversations.map(conversation => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex p-3 rounded-lg cursor-pointer transition-colors ${
              selectedId === conversation.id 
                ? 'bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
          >
            <img 
              src={conversation.participant.profilePic || 'https://via.placeholder.com/40'} 
              alt={conversation.participant.name}
              className="h-12 w-12 rounded-full object-cover mr-3"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className={`font-medium truncate ${!conversation.read ? 'text-black' : 'text-gray-700'}`}>
                  {conversation.participant.name}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                  {formatTime(conversation.updatedAt)}
                </span>
              </div>
              <p className={`text-sm truncate ${!conversation.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                {conversation.lastMessage}
              </p>
            </div>
            
            {!conversation.read && (
              <div className="ml-2 self-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};