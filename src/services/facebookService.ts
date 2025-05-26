import { getFacebookToken } from './supabaseService';
import { FacebookPage, FacebookConversation, FacebookMessage } from '../types/facebook';

// Store mock data in memory for demo purposes
const mockData = {
  conversations: [
    {
      id: 'conv1',
      pageId: 'page1',
      participant: {
        id: 'user1',
        name: 'John Smith',
        profilePic: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      lastMessage: 'Hi there! I have a question about your services',
      updatedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
      read: false
    },
    {
      id: 'conv2',
      pageId: 'page1',
      participant: {
        id: 'user2',
        name: 'Sarah Johnson',
        profilePic: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      lastMessage: 'Thanks for your help yesterday!',
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      read: true
    },
    {
      id: 'conv3',
      pageId: 'page1',
      participant: {
        id: 'user3',
        name: 'Michael Chen',
        profilePic: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      lastMessage: 'Is the promotion still running?',
      updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
      read: true
    }
  ],
  messages: {
    conv1: [
      {
        id: 'msg1',
        conversationId: 'conv1',
        sender: 'them',
        senderName: 'John Smith',
        content: 'Hi there! I have a question about your services',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString() // 15 minutes ago
      }
    ],
    conv2: [
      {
        id: 'msg2',
        conversationId: 'conv2',
        sender: 'them',
        senderName: 'Sarah Johnson',
        content: 'Do you offer consultations?',
        timestamp: new Date(Date.now() - 25 * 3600000).toISOString() // 25 hours ago
      },
      {
        id: 'msg3',
        conversationId: 'conv2',
        sender: 'me',
        content: 'Yes, we do! You can book one through our website or I can help you schedule one here.',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), // 24 hours ago
        status: 'read'
      },
      {
        id: 'msg4',
        conversationId: 'conv2',
        sender: 'them',
        senderName: 'Sarah Johnson',
        content: 'Thanks for your help yesterday!',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
      }
    ],
    conv3: [
      {
        id: 'msg5',
        conversationId: 'conv3',
        sender: 'them',
        senderName: 'Michael Chen',
        content: 'Hello, I saw your ad for the summer sale',
        timestamp: new Date(Date.now() - 26 * 3600000).toISOString() // 26 hours ago
      },
      {
        id: 'msg6',
        conversationId: 'conv3',
        sender: 'me',
        content: 'Hi Michael! Yes, our summer promotion is running until the end of the month.',
        timestamp: new Date(Date.now() - 25 * 3600000).toISOString(), // 25 hours ago
        status: 'read'
      },
      {
        id: 'msg7',
        conversationId: 'conv3',
        sender: 'them',
        senderName: 'Michael Chen',
        content: 'Great! What discounts are available?',
        timestamp: new Date(Date.now() - 25 * 3600000).toISOString() // 25 hours ago
      },
      {
        id: 'msg8',
        conversationId: 'conv3',
        sender: 'me',
        content: 'We\'re offering 20% off all products and 30% off for orders over $100!',
        timestamp: new Date(Date.now() - 24.5 * 3600000).toISOString(), // 24.5 hours ago
        status: 'read'
      },
      {
        id: 'msg9',
        conversationId: 'conv3',
        sender: 'them',
        senderName: 'Michael Chen',
        content: 'Is the promotion still running?',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString() // 24 hours ago
      }
    ]
  },
  sentMessages: []
};

/**
 * Get page access token from storage
 */
const getPageAccessToken = async (pageId: string): Promise<string> => {
  const token = await getFacebookToken(pageId, 'page');
  if (!token) {
    throw new Error('Page access token not found');
  }
  return token;
};

/**
 * Create a webhook subscription for Messenger events
 */
export const createMessengerWebhook = async (pageId: string): Promise<boolean> => {
  try {
    // In this simplified version, we'll just simulate a successful webhook creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, store a fake webhook ID and token in localStorage
    const webhookId = `webhook_${Date.now()}`;
    const webhookToken = `token_${Math.random().toString(36).substring(2, 15)}`;
    
    // Save to local storage using our localStorage utility
    const saveWebhookData = async (pageId: string, webhookId: string, webhookToken: string) => {
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
    
    await saveWebhookData(pageId, webhookId, webhookToken);
    
    return true;
  } catch (error) {
    console.error('Error creating Messenger webhook:', error);
    throw error;
  }
};

/**
 * Set up webhook for a specific Facebook Page
 */
export const setupPageWebhook = async (pageId: string): Promise<boolean> => {
  try {
    const token = await getPageAccessToken(pageId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, we'll assume it was successful
    return true;
  } catch (error) {
    console.error('Error setting up page webhook:', error);
    throw error;
  }
};

/**
 * Fetch conversations for connected Facebook Pages
 */
export const fetchConversations = async (): Promise<FacebookConversation[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data
    return mockData.conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Fetch messages for a specific conversation
 */
export const fetchMessages = async (conversationId: string): Promise<FacebookMessage[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data for the specific conversation
    return mockData.messages[conversationId as keyof typeof mockData.messages] || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message to a Facebook user
 */
export const sendMessage = async (
  pageId: string,
  recipientId: string,
  message: string
): Promise<FacebookMessage> => {
  try {
    const token = await getPageAccessToken(pageId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new message object
    const newMessage: FacebookMessage = {
      id: `msg_${Date.now()}`,
      conversationId: `conv_${recipientId}`,
      sender: 'me',
      content: message,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    
    // Add to local mock data
    mockData.sentMessages.push(newMessage);
    
    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark a conversation as read
 */
export const markAsRead = async (conversationId: string): Promise<boolean> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update the conversation in mock data
    const conversation = mockData.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.read = true;
    }
    
    return true;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};