import { useState, useCallback, useEffect } from 'react';
import { fetchMessages } from '../services/facebookService';
import { FacebookMessage } from '../types/facebook';

/**
 * Custom hook for managing messages in a conversation
 */
export const useMessengerMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<FacebookMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load messages for a conversation
   */
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  /**
   * Add a new message to the conversation
   */
  const addMessage = useCallback((message: FacebookMessage) => {
    setMessages(prev => {
      // If message has a tempId, it's replacing a temp message
      if (message.tempId) {
        return prev.map(m => 
          m.id === message.tempId ? { ...message, id: message.id } : m
        );
      }
      
      // Otherwise, just add the message
      // Remove any duplicates first (by ID)
      const filtered = prev.filter(m => m.id !== message.id);
      return [...filtered, message].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    addMessage
  };
};