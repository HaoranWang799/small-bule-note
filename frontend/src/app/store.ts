import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import {
  apiClient,
  ApiError,
  SOCKET_BASE_URL,
  type ContactPayload,
  type MessagePayload,
  type RelationshipStatus,
  type UserLookupPayload,
} from "../services/api";

const TOKEN_STORAGE_KEY = "im-auth-token";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  status: string;
}

export interface ChatTarget {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  online: boolean;
  relationshipStatus: RelationshipStatus;
  friendshipId?: string;
}

export interface Contact extends ChatTarget {
  relationshipStatus: "accepted";
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  createdAt: string;
  status: "sent" | "delivered" | "read";
  clientMessageId?: string;
}

export interface Conversation {
  id: string;
  target: ChatTarget;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface AppState {
  isInitializing: boolean;
  hasInitialized: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string | null;
  contacts: Contact[];
  directory: Record<string, ChatTarget>;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  socketStatus: "connecting" | "connected" | "disconnected";
  activeChatId: string | null;
  lastError: string | null;
  setActiveChat: (contactId: string | null) => void;
  initializeAuth: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<ActionResult>;
  register: (username: string, email: string, password: string) => Promise<ActionResult>;
  logout: () => void;
  updateProfile: (data: { username?: string; email?: string; status?: string }) => Promise<ActionResult>;
  refreshContacts: () => Promise<void>;
  searchUsers: (query: string) => Promise<ChatTarget[]>;
  ensureChatTarget: (userId: string) => Promise<ChatTarget | null>;
  addFriend: (userId: string) => Promise<ActionResult>;
  openChat: (contactId: string) => Promise<void>;
  sendMessage: (contactId: string, content: string) => Promise<ActionResult>;
  clearError: () => void;
}

let socket: Socket | null = null;
let initializationPromise: Promise<void> | null = null;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConversationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return formatMessageTime(iso);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "昨天";
  }

  return date.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}

function normalizeUser(raw: {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  status?: string;
}): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    avatarUrl: raw.avatar_url || "",
    status: raw.status || "offline",
  };
}

function normalizeTarget(raw: UserLookupPayload | ContactPayload): ChatTarget {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email || "",
    avatarUrl: raw.avatar_url || "",
    online: raw.status === "online",
    relationshipStatus: raw.relationship_status,
    friendshipId: "friendship_id" in raw ? raw.friendship_id : undefined,
  };
}

function normalizeContact(raw: ContactPayload): Contact {
  return {
    ...normalizeTarget(raw),
    relationshipStatus: "accepted",
    friendshipId: raw.friendship_id,
  };
}

function normalizeMessage(raw: MessagePayload): Message {
  return {
    id: raw.id,
    senderId: raw.sender_id,
    receiverId: raw.receiver_id,
    content: raw.content,
    timestamp: formatMessageTime(raw.created_at),
    createdAt: raw.created_at,
    status: raw.status,
  };
}

function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function createOptimisticMessage(currentUserId: string, contactId: string, content: string): Message {
  const createdAt = new Date().toISOString();
  return {
    id: `client-${crypto.randomUUID()}`,
    clientMessageId: crypto.randomUUID(),
    senderId: currentUserId,
    receiverId: contactId,
    content,
    createdAt,
    timestamp: formatMessageTime(createdAt),
    status: "sent",
  };
}

function persistToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function mergeDirectory(
  current: Record<string, ChatTarget>,
  targets: ChatTarget[]
): Record<string, ChatTarget> {
  if (targets.length === 0) {
    return current;
  }

  const next = { ...current };
  for (const target of targets) {
    next[target.id] = {
      ...(next[target.id] || {}),
      ...target,
    };
  }

  return next;
}

function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

function buildConversations(
  currentUserId: string | null,
  contacts: Contact[],
  directory: Record<string, ChatTarget>,
  messages: Record<string, Message[]>
): Conversation[] {
  const acceptedIds = contacts.map((contact) => contact.id);
  const messageIds = Object.entries(messages)
    .filter(([, chatMessages]) => chatMessages.length > 0)
    .map(([id]) => id);
  const ids = Array.from(new Set([...acceptedIds, ...messageIds]));

  return ids
    .map((id) => {
      const target = directory[id];
      if (!target) {
        return null;
      }

      const chatMessages = sortMessages(messages[id] || []);
      const latestMessage = chatMessages[chatMessages.length - 1];
      const unread = currentUserId
        ? chatMessages.filter(
            (message) => message.senderId === id && message.status !== "read"
          ).length
        : 0;

      return {
        id,
        target,
        lastMessage: latestMessage?.content || "开始聊天",
        timestamp: latestMessage ? formatConversationTime(latestMessage.createdAt) : "",
        unread,
      };
    })
    .filter((conversation): conversation is Conversation => Boolean(conversation))
    .sort((a, b) => {
      const aMessages = messages[a.id] || [];
      const bMessages = messages[b.id] || [];
      const aLatest = aMessages[aMessages.length - 1];
      const bLatest = bMessages[bMessages.length - 1];
      const aTime = aLatest ? new Date(aLatest.createdAt).getTime() : 0;
      const bTime = bLatest ? new Date(bLatest.createdAt).getTime() : 0;

      if (aTime === bTime) {
        return a.target.username.localeCompare(b.target.username, "zh-CN");
      }

      return bTime - aTime;
    });
}

async function loadContactHistories(token: string, contacts: Contact[]) {
  const entries = await Promise.all(
    contacts.map(async (contact) => {
      try {
        const history = await apiClient.getMessageHistory(token, contact.id, 100);
        return [contact.id, history.data.messages.map(normalizeMessage)] as const;
      } catch {
        return [contact.id, [] as Message[]] as const;
      }
    })
  );

  return Object.fromEntries(entries) as Record<string, Message[]>;
}

async function hydrateSession(
  token: string,
  set: (partial: Partial<AppState>) => void,
  get: () => AppState,
  fallbackUser?: User | null
) {
  const profileResponse = await apiClient.getProfile(token);
  const currentUser = normalizeUser(profileResponse.data);
  const contactsResponse = await apiClient.getContacts(token);
  const contacts = contactsResponse.data.map(normalizeContact);
  const directory = mergeDirectory({}, contacts);
  const messages = await loadContactHistories(token, contacts);
  const conversations = buildConversations(currentUser.id, contacts, directory, messages);

  set({
    token,
    currentUser: currentUser || fallbackUser || null,
    contacts,
    directory,
    messages,
    conversations,
    isAuthenticated: true,
    isInitializing: false,
    hasInitialized: true,
    lastError: null,
  });

  connectSocket(token, set, get);
}

async function ensureSocketConnected(
  token: string,
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void,
  get: () => AppState
): Promise<Socket | null> {
  connectSocket(token, set, get);

  if (socket?.connected) {
    return socket;
  }

  return await new Promise((resolve) => {
    if (!socket) {
      resolve(null);
      return;
    }

    const handleConnect = () => {
      cleanup();
      resolve(socket);
    };

    const handleError = () => {
      cleanup();
      resolve(null);
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      socket?.off("connect", handleConnect);
      socket?.off("connect_error", handleError);
    };

    const timer = window.setTimeout(() => {
      cleanup();
      resolve(socket?.connected ? socket : null);
    }, 2500);

    socket.once("connect", handleConnect);
    socket.once("connect_error", handleError);
  });
}

function updateMessagesForContact(
  state: AppState,
  contactId: string,
  updater: (messages: Message[]) => Message[]
) {
  const nextMessages = {
    ...state.messages,
    [contactId]: sortMessages(updater(state.messages[contactId] || [])),
  };

  return {
    messages: nextMessages,
    conversations: buildConversations(
      state.currentUser?.id || null,
      state.contacts,
      state.directory,
      nextMessages
    ),
  };
}

function markMessagesAsRead(
  contactId: string,
  set: (updater: (state: AppState) => Partial<AppState>) => void,
  get: () => AppState
) {
  const unreadIds = (get().messages[contactId] || [])
    .filter((message) => message.senderId === contactId && message.status !== "read")
    .map((message) => message.id);

  if (unreadIds.length === 0) {
    return;
  }

  set((state) =>
    updateMessagesForContact(state, contactId, (messages) =>
      messages.map((message) =>
        unreadIds.includes(message.id) ? { ...message, status: "read" } : message
      )
    )
  );

  if (socket?.connected) {
    socket.emit("message:read", { message_ids: unreadIds });
  }
}

function connectSocket(
  token: string,
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void,
  get: () => AppState
) {
  if (socket && socket.auth?.token === token) {
    if (!socket.connected) {
      socket.connect();
      set({ socketStatus: "connecting" });
    }
    return;
  }

  disconnectSocket();
  set({ socketStatus: "connecting" });

  socket = io(SOCKET_BASE_URL, {
    transports: ["websocket", "polling"],
    auth: { token },
  });

  socket.on("connect", () => {
    set({ socketStatus: "connected" });
  });

  socket.on("disconnect", () => {
    set({ socketStatus: "disconnected" });
  });

  socket.on("connect_error", (error) => {
    set({
      socketStatus: "disconnected",
      lastError: error.message || "WebSocket 连接失败",
    });
  });

  socket.on("user:online", ({ userId }: { userId: string }) => {
    set((state) => {
      const target = state.directory[userId];
      if (!target) {
        return {};
      }

      const directory = mergeDirectory(state.directory, [{ ...target, online: true }]);
      const contacts = state.contacts.map((contact) =>
        contact.id === userId ? { ...contact, online: true } : contact
      );

      return {
        directory,
        contacts,
        conversations: buildConversations(
          state.currentUser?.id || null,
          contacts,
          directory,
          state.messages
        ),
      };
    });
  });

  socket.on("user:offline", ({ userId }: { userId: string }) => {
    set((state) => {
      const target = state.directory[userId];
      if (!target) {
        return {};
      }

      const directory = mergeDirectory(state.directory, [{ ...target, online: false }]);
      const contacts = state.contacts.map((contact) =>
        contact.id === userId ? { ...contact, online: false } : contact
      );

      return {
        directory,
        contacts,
        conversations: buildConversations(
          state.currentUser?.id || null,
          contacts,
          directory,
          state.messages
        ),
      };
    });
  });

  socket.on(
    "message:receive",
    (payload: {
      id: string;
      sender_id: string;
      content: string;
      message_type: string;
      status: "sent" | "delivered" | "read";
      created_at: string;
    }) => {
      const contactId = payload.sender_id;
      const tokenValue = get().token;

      if (tokenValue && !get().directory[contactId]) {
        void apiClient.getUserSummary(tokenValue, contactId)
          .then((response) => {
            const target = normalizeTarget(response.data);
            set((state) => ({
              directory: mergeDirectory(state.directory, [target]),
              conversations: buildConversations(
                state.currentUser?.id || null,
                state.contacts,
                mergeDirectory(state.directory, [target]),
                state.messages
              ),
            }));
          })
          .catch(() => {});
      }

      set((state) => {
        const rawMessage: MessagePayload = {
          id: payload.id,
          sender_id: payload.sender_id,
          receiver_id: state.currentUser?.id || "",
          content: payload.content,
          message_type: payload.message_type,
          status: payload.status,
          created_at: payload.created_at,
        };

        return updateMessagesForContact(state, contactId, (messages) => {
          const nextMessages = messages.filter((message) => message.id !== payload.id);
          return [...nextMessages, normalizeMessage(rawMessage)];
        });
      });

      if (get().activeChatId === contactId) {
        markMessagesAsRead(contactId, set, get);
      }
    }
  );

  socket.on(
    "message:sent",
    (payload: {
      message_id: string;
      client_message_id?: string;
      timestamp: string;
      status: "sent" | "delivered" | "read";
    }) => {
      set((state) => {
        let changed = false;
        const nextMessages = Object.fromEntries(
          Object.entries(state.messages).map(([contactId, chatMessages]) => [
            contactId,
            chatMessages.map((message) => {
              if (
                payload.client_message_id &&
                message.clientMessageId === payload.client_message_id
              ) {
                changed = true;
                return {
                  ...message,
                  id: payload.message_id,
                  createdAt: payload.timestamp,
                  timestamp: formatMessageTime(payload.timestamp),
                  status: payload.status,
                };
              }

              return message;
            }),
          ])
        ) as Record<string, Message[]>;

        if (!changed) {
          return {};
        }

        return {
          messages: nextMessages,
          conversations: buildConversations(
            state.currentUser?.id || null,
            state.contacts,
            state.directory,
            nextMessages
          ),
        };
      });
    }
  );

  socket.on("error", (payload: { message?: string }) => {
    set({
      lastError: payload.message || "消息服务出现错误",
    });
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitializing: true,
  hasInitialized: false,
  isAuthenticated: false,
  currentUser: null,
  token: null,
  contacts: [],
  directory: {},
  conversations: [],
  messages: {},
  socketStatus: "disconnected",
  activeChatId: null,
  lastError: null,

  setActiveChat: (contactId) => {
    set({ activeChatId: contactId });
  },

  initializeAuth: async () => {
    if (initializationPromise) {
      await initializationPromise;
      return;
    }

    initializationPromise = (async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token) {
        set({
          isInitializing: false,
          hasInitialized: true,
          isAuthenticated: false,
          currentUser: null,
          token: null,
          contacts: [],
          directory: {},
          conversations: [],
          messages: {},
          socketStatus: "disconnected",
        });
        return;
      }

      set({ isInitializing: true, token });

      try {
        await hydrateSession(token, set, get);
      } catch (error) {
        disconnectSocket();
        persistToken(null);
        set({
          isInitializing: false,
          hasInitialized: true,
          isAuthenticated: false,
          currentUser: null,
          token: null,
          contacts: [],
          directory: {},
          conversations: [],
          messages: {},
          socketStatus: "disconnected",
          lastError: getErrorMessage(error, "登录状态已失效，请重新登录"),
        });
      }
    })();

    try {
      await initializationPromise;
    } finally {
      initializationPromise = null;
    }
  },

  login: async (identifier, password) => {
    try {
      const response = await apiClient.login({ identifier, password });
      const token = response.data.access_token;
      persistToken(token);
      set({ token, isInitializing: true });
      await hydrateSession(token, set, get, normalizeUser(response.data.user));
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "登录失败，请检查账号和密码");
      persistToken(null);
      set({
        isInitializing: false,
        isAuthenticated: false,
        token: null,
        lastError: message,
      });
      return { success: false, error: message };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await apiClient.register({ username, email, password });
      const token = response.data.access_token;
      persistToken(token);
      set({ token, isInitializing: true });
      await hydrateSession(token, set, get, normalizeUser(response.data.user));
      return { success: true, message: "注册成功" };
    } catch (error) {
      const message = getErrorMessage(error, "注册失败，请稍后再试");
      set({ lastError: message, isInitializing: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    disconnectSocket();
    persistToken(null);
    set({
      isInitializing: false,
      hasInitialized: true,
      isAuthenticated: false,
      currentUser: null,
      token: null,
      contacts: [],
      directory: {},
      conversations: [],
      messages: {},
      socketStatus: "disconnected",
      activeChatId: null,
      lastError: null,
    });
  },

  updateProfile: async (data) => {
    const { token, currentUser } = get();
    if (!token || !currentUser) {
      return { success: false, error: "请先登录" };
    }

    try {
      const response = await apiClient.updateProfile(token, data);
      set({
        currentUser: normalizeUser(response.data),
        lastError: null,
      });
      return { success: true, message: "资料已更新" };
    } catch (error) {
      const message = getErrorMessage(error, "更新资料失败");
      set({ lastError: message });
      return { success: false, error: message };
    }
  },

  refreshContacts: async () => {
    const { token, currentUser, messages, directory } = get();
    if (!token || !currentUser) {
      return;
    }

    try {
      const response = await apiClient.getContacts(token);
      const contacts = response.data.map(normalizeContact);
      const nextDirectory = mergeDirectory(directory, contacts);
      const nextMessages = { ...messages };

      for (const contact of contacts) {
        if (!nextMessages[contact.id]) {
          try {
            const history = await apiClient.getMessageHistory(token, contact.id, 100);
            nextMessages[contact.id] = history.data.messages.map(normalizeMessage);
          } catch {
            nextMessages[contact.id] = [];
          }
        }
      }

      set({
        contacts,
        directory: nextDirectory,
        messages: nextMessages,
        conversations: buildConversations(currentUser.id, contacts, nextDirectory, nextMessages),
      });
    } catch (error) {
      set({ lastError: getErrorMessage(error, "刷新联系人失败") });
    }
  },

  searchUsers: async (query) => {
    const token = get().token;
    if (!token || !query.trim()) {
      return [];
    }

    try {
      const response = await apiClient.searchUsers(token, query.trim());
      const results = response.data.map(normalizeTarget);
      set((state) => ({
        directory: mergeDirectory(state.directory, results),
      }));
      return results;
    } catch (error) {
      set({ lastError: getErrorMessage(error, "搜索用户失败") });
      return [];
    }
  },

  ensureChatTarget: async (userId) => {
    const { token, directory } = get();
    if (!token) {
      return null;
    }

    if (directory[userId]) {
      return directory[userId];
    }

    try {
      const response = await apiClient.getUserSummary(token, userId);
      const target = normalizeTarget(response.data);
      set((state) => ({
        directory: mergeDirectory(state.directory, [target]),
        conversations: buildConversations(
          state.currentUser?.id || null,
          state.contacts,
          mergeDirectory(state.directory, [target]),
          state.messages
        ),
      }));
      return target;
    } catch (error) {
      set({ lastError: getErrorMessage(error, "加载用户信息失败") });
      return null;
    }
  },

  addFriend: async (userId) => {
    const { token } = get();
    if (!token) {
      return { success: false, error: "请先登录" };
    }

    try {
      const response = await apiClient.addContact(token, { friendId: userId });
      const summary = await apiClient.getUserSummary(token, userId);
      const target = normalizeTarget(summary.data);

      set((state) => ({
        directory: mergeDirectory(state.directory, [target]),
        conversations: buildConversations(
          state.currentUser?.id || null,
          state.contacts,
          mergeDirectory(state.directory, [target]),
          state.messages
        ),
        lastError: null,
      }));

      if (target.relationshipStatus === "accepted") {
        await get().refreshContacts();
      }

      return {
        success: true,
        message: response.message || response.data.message || "好友请求已发送",
      };
    } catch (error) {
      const message = getErrorMessage(error, "好友操作失败");
      set({ lastError: message });
      return { success: false, error: message };
    }
  },

  openChat: async (contactId) => {
    const { token, currentUser } = get();
    set({ activeChatId: contactId });

    if (!token || !currentUser) {
      return;
    }

    await get().ensureChatTarget(contactId);

    try {
      const history = await apiClient.getMessageHistory(token, contactId, 100);
      const nextMessages = {
        ...get().messages,
        [contactId]: history.data.messages.map(normalizeMessage),
      };

      set((state) => ({
        messages: nextMessages,
        conversations: buildConversations(
          currentUser.id,
          state.contacts,
          state.directory,
          nextMessages
        ),
      }));

      markMessagesAsRead(contactId, set, get);
    } catch (error) {
      set({ lastError: getErrorMessage(error, "加载聊天记录失败") });
    }
  },

  sendMessage: async (contactId, content) => {
    const { token, currentUser } = get();
    const trimmed = content.trim();

    if (!token || !currentUser) {
      return { success: false, error: "请先登录" };
    }

    if (!trimmed) {
      return { success: false, error: "消息内容不能为空" };
    }

    await get().ensureChatTarget(contactId);

    const optimisticMessage = createOptimisticMessage(currentUser.id, contactId, trimmed);
    set((state) =>
      updateMessagesForContact(state, contactId, (messages) => [...messages, optimisticMessage])
    );

    const activeSocket = await ensureSocketConnected(token, set, get);
    if (!activeSocket) {
      set((state) =>
        updateMessagesForContact(state, contactId, (messages) =>
          messages.filter((message) => message.id !== optimisticMessage.id)
        )
      );
      return { success: false, error: "消息服务暂时不可用，请稍后再试" };
    }

    activeSocket.emit("message:send", {
      receiver_id: contactId,
      content: trimmed,
      client_message_id: optimisticMessage.clientMessageId,
    });

    return { success: true };
  },

  clearError: () => {
    set({ lastError: null });
  },
}));
