// Facebook User Information
export interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    }
  };
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

// Facebook Page Information
export interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  access_token?: string;
  tasks: string[];
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    }
  };
}

// Facebook Conversation
export interface FacebookConversation {
  id: string;
  pageId: string;
  participant: {
    id: string;
    name: string;
    profilePic?: string;
  };
  lastMessage: string;
  updatedAt: string;
  read: boolean;
}

// Facebook Message
export interface FacebookMessage {
  id: string;
  conversationId: string;
  sender: 'me' | 'them';
  senderName?: string;
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  tempId?: string;
}

// Facebook SDK Window Extension
declare global {
  interface Window {
    FB: {
      init: (options: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse: {
            accessToken: string;
            userID: string;
            expiresIn: number;
            signedRequest: string;
            graphDomain: string;
          } | null;
          status: 'connected' | 'not_authorized' | 'unknown';
        }) => void,
        options: {
          scope: string;
        }
      ) => void;
      logout: (callback: () => void) => void;
      getLoginStatus: (
        callback: (response: {
          authResponse: {
            accessToken: string;
            userID: string;
            expiresIn: number;
            signedRequest: string;
            graphDomain: string;
          } | null;
          status: 'connected' | 'not_authorized' | 'unknown';
        }) => void
      ) => void;
      api: (
        path: string,
        params: Record<string, any>,
        callback: (response: any) => void
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}