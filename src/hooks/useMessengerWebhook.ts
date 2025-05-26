import { useState, useCallback } from 'react';
import { createMessengerWebhook } from '../services/facebookService';

/**
 * Custom hook for handling Messenger webhook setup
 */
export const useMessengerWebhook = (pageId: string) => {
  const [webhookStatus, setWebhookStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Setup webhook for receiving Messenger messages
  const setupWebhook = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create the webhook subscription
      const success = await createMessengerWebhook(pageId);
      setWebhookStatus(success);
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set up webhook';
      setError(errorMessage);
      setWebhookStatus(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  return {
    webhookStatus,
    isLoading,
    error,
    setupWebhook
  };
};