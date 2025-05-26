/**
 * LocalStorage implementation for token storage
 * This replaces Supabase with a client-side only solution
 */

type TokenType = 'short_lived' | 'long_lived' | 'page';

interface TokenData {
  id: string;
  token: string;
  tokenType: TokenType;
  createdAt: string;
  expiresAt?: string;
}

const STORAGE_KEY = 'hooktxt_facebook_tokens';

/**
 * Save Facebook access token to localStorage
 */
export const saveFacebookToken = async (
  id: string, 
  token: string, 
  tokenType: TokenType
): Promise<void> => {
  try {
    // Get existing tokens
    const existingTokensStr = localStorage.getItem(STORAGE_KEY);
    const existingTokens: TokenData[] = existingTokensStr ? JSON.parse(existingTokensStr) : [];
    
    // Find index of token with same id and type if it exists
    const existingIndex = existingTokens.findIndex(t => t.id === id && t.tokenType === tokenType);
    
    // Create new token data
    const tokenData: TokenData = {
      id,
      token,
      tokenType,
      createdAt: new Date().toISOString()
    };
    
    // Update or add the token
    if (existingIndex >= 0) {
      existingTokens[existingIndex] = tokenData;
    } else {
      existingTokens.push(tokenData);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTokens));
    
  } catch (error) {
    console.error('Error saving Facebook token:', error);
    throw error;
  }
};

/**
 * Get Facebook access token from localStorage
 */
export const getFacebookToken = async (
  id: string,
  tokenType: TokenType
): Promise<string | null> => {
  try {
    const tokensStr = localStorage.getItem(STORAGE_KEY);
    if (!tokensStr) return null;
    
    const tokens: TokenData[] = JSON.parse(tokensStr);
    const token = tokens.find(t => t.id === id && t.tokenType === tokenType);
    
    return token?.token || null;
  } catch (error) {
    console.error('Error getting Facebook token:', error);
    return null;
  }
};

/**
 * Store webhook data in localStorage
 */
export const saveWebhookData = async (
  pageId: string,
  webhookId: string,
  webhookToken: string
): Promise<void> => {
  try {
    const WEBHOOK_STORAGE_KEY = 'hooktxt_facebook_webhooks';
    
    // Get existing webhook data
    const existingDataStr = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
    
    // Find existing entry
    const existingIndex = existingData.findIndex((item: any) => item.pageId === pageId);
    
    // Create new webhook data
    const webhookData = {
      pageId,
      webhookId,
      webhookToken,
      createdAt: new Date().toISOString()
    };
    
    // Update or add the webhook data
    if (existingIndex >= 0) {
      existingData[existingIndex] = webhookData;
    } else {
      existingData.push(webhookData);
    }
    
    // Save to localStorage
    localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(existingData));
    
  } catch (error) {
    console.error('Error saving webhook data:', error);
    throw error;
  }
};