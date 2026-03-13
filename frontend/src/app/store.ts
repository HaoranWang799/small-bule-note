import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

export interface Contact {
  id: string;
  username: string;
  avatar: string;
  online: boolean;
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string | null;
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;

  // Contacts
  contacts: Contact[];
  addFriend: (username: string) => boolean;

  // Conversations
  conversations: Conversation[];

  // Messages
  messages: Record<string, Message[]>;
  sendMessage: (contactId: string, content: string) => void;

  // Socket
  socketStatus: "connected" | "disconnected";
}

const mockContacts: Contact[] = [
  { id: "2", username: "Alice", avatar: "", online: true },
  { id: "3", username: "Bob", avatar: "", online: false },
  { id: "4", username: "Charlie", avatar: "", online: true },
  { id: "5", username: "Diana", avatar: "", online: true },
  { id: "6", username: "Eve", avatar: "", online: false },
];

const mockMessages: Record<string, Message[]> = {
  "2": [
    { id: "m1", senderId: "2", receiverId: "1", content: "你好！最近怎么样？", timestamp: "09:30", status: "read" },
    { id: "m2", senderId: "1", receiverId: "2", content: "挺好的，谢谢！你呢？", timestamp: "09:31", status: "read" },
    { id: "m3", senderId: "2", receiverId: "1", content: "我也不错，周末有空吗？", timestamp: "09:32", status: "read" },
    { id: "m4", senderId: "1", receiverId: "2", content: "有空的，一起出去玩？", timestamp: "09:33", status: "delivered" },
  ],
  "3": [
    { id: "m5", senderId: "3", receiverId: "1", content: "项目进度更新了吗？", timestamp: "昨天", status: "read" },
    { id: "m6", senderId: "1", receiverId: "3", content: "已经完成80%了", timestamp: "昨天", status: "read" },
    { id: "m7", senderId: "3", receiverId: "1", content: "好的，辛苦了", timestamp: "昨天", status: "read" },
  ],
  "4": [
    { id: "m8", senderId: "4", receiverId: "1", content: "明天的会议几点？", timestamp: "10:15", status: "read" },
    { id: "m9", senderId: "1", receiverId: "4", content: "下午2点，在3号会议室", timestamp: "10:16", status: "sent" },
  ],
  "5": [
    { id: "m10", senderId: "5", receiverId: "1", content: "收到文件了，谢谢！", timestamp: "08:45", status: "read" },
  ],
};

const mockConversations: Conversation[] = [
  { id: "c1", contact: mockContacts[0], lastMessage: "有空的，一起出去玩？", timestamp: "09:33", unread: 0 },
  { id: "c2", contact: mockContacts[1], lastMessage: "好的，辛苦了", timestamp: "昨天", unread: 2 },
  { id: "c3", contact: mockContacts[2], lastMessage: "下午2点，在3号会议室", timestamp: "10:16", unread: 1 },
  { id: "c4", contact: mockContacts[3], lastMessage: "收到文件了，谢谢！", timestamp: "08:45", unread: 0 },
];

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  token: null,
  socketStatus: "disconnected",
  contacts: mockContacts,
  conversations: mockConversations,
  messages: mockMessages,

  login: (email: string, _password: string) => {
    set({
      isAuthenticated: true,
      currentUser: {
        id: "1",
        username: "张三",
        email: email,
        avatar: "",
      },
      token: "mock-jwt-token",
      socketStatus: "connected",
    });
    return true;
  },

  register: (_username: string, _email: string, _password: string) => {
    return true;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
      token: null,
      socketStatus: "disconnected",
    });
  },

  updateProfile: (data: Partial<User>) => {
    const current = get().currentUser;
    if (current) {
      set({ currentUser: { ...current, ...data } });
    }
  },

  addFriend: (username: string) => {
    const existing = get().contacts.find((c) => c.username === username);
    if (existing) return false;
    const newContact: Contact = {
      id: String(Date.now()),
      username,
      avatar: "",
      online: false,
    };
    set({ contacts: [...get().contacts, newContact] });
    return true;
  },

  sendMessage: (contactId: string, content: string) => {
    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "1",
      receiverId: contactId,
      content,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    const msgs = get().messages;
    const existing = msgs[contactId] || [];
    set({
      messages: { ...msgs, [contactId]: [...existing, newMsg] },
    });

    // Update conversation last message
    const convs = get().conversations;
    const convIndex = convs.findIndex((c) => c.contact.id === contactId);
    if (convIndex >= 0) {
      const updated = [...convs];
      updated[convIndex] = { ...updated[convIndex], lastMessage: content, timestamp: newMsg.timestamp };
      set({ conversations: updated });
    } else {
      const contact = get().contacts.find((c) => c.id === contactId);
      if (contact) {
        set({
          conversations: [
            { id: `c${Date.now()}`, contact, lastMessage: content, timestamp: newMsg.timestamp, unread: 0 },
            ...convs,
          ],
        });
      }
    }

    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = ["好的！", "收到", "没问题", "👍", "稍等一下", "我知道了", "哈哈"];
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        senderId: contactId,
        receiverId: "1",
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        status: "read",
      };
      const currentMsgs = get().messages;
      const currentExisting = currentMsgs[contactId] || [];
      set({
        messages: { ...currentMsgs, [contactId]: [...currentExisting, reply] },
      });
    }, 1500);
  },
}));
