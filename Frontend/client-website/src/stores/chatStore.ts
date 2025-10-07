import { create } from "zustand";
import { persist } from "zustand/middleware";

// Chat interface matching database schema
export interface Chat {
  id: string; // BIGINT PRIMARY KEY AUTO_INCREMENT
  customerId: string; // BIGINT NOT NULL references users(id)
  staffId?: string; // BIGINT references users(id)
  startedAt: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  closedAt?: string; // DATETIME
  channel: string; // VARCHAR(30) DEFAULT 'WEB'
  
  // Populated fields from joins
  customer?: {
    id: string;
    fullName: string;
    email?: string;
  };
  staff?: {
    id: string;
    fullName: string;
    email?: string;
  };
  messages?: ChatMessage[];
  lastMessage?: ChatMessage;
}

// Chat message interface matching database schema
export interface ChatMessage {
  id: string; // BIGINT PRIMARY KEY AUTO_INCREMENT
  chatId: string; // BIGINT NOT NULL references chats(id)
  senderType: "CUSTOMER" | "STAFF" | "BOT"; // ENUM NOT NULL
  message: string; // TEXT NOT NULL
  createdAt: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  
  // Additional fields for UI
  isRead?: boolean;
  sender?: {
    id: string;
    fullName: string;
    type: "CUSTOMER" | "STAFF" | "BOT";
  };
}

export type ChatStatus = "active" | "closed" | "pending";

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: { [chatId: string]: ChatMessage[] };
  isLoading: boolean;
  error: string | null;

  // Chat management
  createChat: (customerId: string, channel?: string) => Promise<string>;
  assignStaff: (chatId: string, staffId: string) => Promise<void>;
  closeChat: (chatId: string) => Promise<void>;
  reopenChat: (chatId: string) => Promise<void>;
  
  // Message management
  sendMessage: (chatId: string, message: string, senderType: "CUSTOMER" | "STAFF" | "BOT") => Promise<void>;
  markMessageAsRead: (messageId: string) => void;
  markChatAsRead: (chatId: string) => void;
  
  // Fetching methods
  fetchChats: () => Promise<void>;
  fetchChatMessages: (chatId: string) => Promise<void>;
  getChat: (id: string) => Chat | undefined;
  setActiveChat: (chat: Chat | null) => void;
  
  // Filtering and searching
  getActiveChats: () => Chat[];
  getClosedChats: () => Chat[];
  getPendingChats: () => Chat[];
  getChatsByStaff: (staffId: string) => Chat[];
  getChatsByCustomer: (customerId: string) => Chat[];
  searchChats: (query: string) => Chat[];
  
  // Statistics
  getUnreadMessageCount: (chatId?: string) => number;
  getAverageResponseTime: () => number;
  getChatDuration: (chatId: string) => number; // in minutes
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      messages: {},
      isLoading: false,
      error: null,

      // Chat management
      createChat: async (customerId, channel = "WEB") => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          const newChat: Chat = {
            id: Date.now().toString(),
            customerId,
            channel,
            startedAt: new Date().toISOString(),
          };

          set((state) => ({
            chats: [...state.chats, newChat],
            activeChat: newChat,
            isLoading: false,
          }));
          
          return newChat.id;
        } catch (error) {
          set({ 
            error: "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.",
            isLoading: false 
          });
          throw error;
        }
      },

      assignStaff: async (chatId, staffId) => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 300));
          
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId ? { ...chat, staffId } : chat
            ),
            activeChat: state.activeChat?.id === chatId 
              ? { ...state.activeChat, staffId } 
              : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: "Không thể phân công nhân viên. Vui lòng thử lại.",
            isLoading: false 
          });
          throw error;
        }
      },

      closeChat: async (chatId) => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 300));
          
          const closedAt = new Date().toISOString();
          
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId ? { ...chat, closedAt } : chat
            ),
            activeChat: state.activeChat?.id === chatId 
              ? { ...state.activeChat, closedAt } 
              : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: "Không thể đóng cuộc trò chuyện. Vui lòng thử lại.",
            isLoading: false 
          });
          throw error;
        }
      },

      reopenChat: async (chatId) => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 300));
          
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId ? { ...chat, closedAt: undefined } : chat
            ),
            activeChat: state.activeChat?.id === chatId 
              ? { ...state.activeChat, closedAt: undefined } 
              : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: "Không thể mở lại cuộc trò chuyện. Vui lòng thử lại.",
            isLoading: false 
          });
          throw error;
        }
      },

      // Message management
      sendMessage: async (chatId, messageText, senderType) => {
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 200));
          
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            chatId,
            senderType,
            message: messageText,
            createdAt: new Date().toISOString(),
            isRead: false,
          };

          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: [...(state.messages[chatId] || []), newMessage],
            },
            chats: state.chats.map((chat) =>
              chat.id === chatId ? { ...chat, lastMessage: newMessage } : chat
            ),
          }));
        } catch (error) {
          set({ error: "Không thể gửi tin nhắn. Vui lòng thử lại." });
          throw error;
        }
      },

      markMessageAsRead: (messageId) => {
        set((state) => {
          const updatedMessages = { ...state.messages };
          
          Object.keys(updatedMessages).forEach((chatId) => {
            updatedMessages[chatId] = updatedMessages[chatId].map((msg) =>
              msg.id === messageId ? { ...msg, isRead: true } : msg
            );
          });
          
          return { messages: updatedMessages };
        });
      },

      markChatAsRead: (chatId) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] || []).map((msg) => ({
              ...msg,
              isRead: true,
            })),
          },
        }));
      },

      // Fetching methods
      fetchChats: async () => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Mock data will be loaded from API
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: "Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại.",
            isLoading: false 
          });
        }
      },

      fetchChatMessages: async (chatId) => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Messages would be loaded from API
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: "Không thể tải tin nhắn. Vui lòng thử lại.",
            isLoading: false 
          });
        }
      },

      getChat: (id) => {
        const { chats } = get();
        return chats.find((chat) => chat.id === id);
      },

      setActiveChat: (chat) => {
        set({ activeChat: chat });
      },

      // Filtering and searching
      getActiveChats: () => {
        const { chats } = get();
        return chats.filter((chat) => !chat.closedAt);
      },

      getClosedChats: () => {
        const { chats } = get();
        return chats.filter((chat) => chat.closedAt);
      },

      getPendingChats: () => {
        const { chats } = get();
        return chats.filter((chat) => !chat.staffId && !chat.closedAt);
      },

      getChatsByStaff: (staffId) => {
        const { chats } = get();
        return chats.filter((chat) => chat.staffId === staffId);
      },

      getChatsByCustomer: (customerId) => {
        const { chats } = get();
        return chats.filter((chat) => chat.customerId === customerId);
      },

      searchChats: (query) => {
        const { chats } = get();
        const lowercaseQuery = query.toLowerCase();
        return chats.filter(
          (chat) =>
            chat.customer?.fullName?.toLowerCase().includes(lowercaseQuery) ||
            chat.customer?.email?.toLowerCase().includes(lowercaseQuery) ||
            chat.staff?.fullName?.toLowerCase().includes(lowercaseQuery)
        );
      },

      // Statistics
      getUnreadMessageCount: (chatId) => {
        const { messages } = get();
        
        if (chatId) {
          const chatMessages = messages[chatId] || [];
          return chatMessages.filter((msg) => !msg.isRead).length;
        }
        
        // Count unread messages across all chats
        return Object.values(messages).flat().filter((msg) => !msg.isRead).length;
      },

      getAverageResponseTime: () => {
        // Mock implementation - would calculate from actual message timestamps
        return 5.2; // minutes
      },

      getChatDuration: (chatId) => {
        const chat = get().getChat(chatId);
        if (!chat) return 0;
        
        const startTime = new Date(chat.startedAt);
        const endTime = chat.closedAt ? new Date(chat.closedAt) : new Date();
        
        return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      },

      // State management
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        chats: state.chats,
        messages: state.messages,
      }),
    }
  )
);