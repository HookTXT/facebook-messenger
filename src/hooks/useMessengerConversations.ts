import { useState, useCallback } from 'react';
import { fetchConversations } from '../services/facebookService';
import { FacebookConversation } from '../types/facebook';

/**
 * Custom hook for managing Messenger conversations
 */
export const useMessengerConversations = () => {
  const [conversations, setConversations] = useState<FacebookConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load conversations from the API
   */
  const loadConversations = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Failed to load conversations:', err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Mark a conversation as read locally
   */
  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, read: true } 
          : conv
      )
    );
  }, []);

  /**
   * Add a new message to a conversation
   */
  const updateConversation = useCallback((conversationId: string, lastMessage: string) => {
    setConversations(prev => {
      const updatedConversations = prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage, 
              updatedAt: new Date().toISOString() 
            } 
          : conv
      );
      
      // Sort conversations by update time
      return updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, []);

  return {
    conversations,
    isLoading,
    error,
    loadConversations,
    markAsRead,
    updateConversation
  };
};