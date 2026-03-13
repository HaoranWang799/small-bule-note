const DEFAULT_DEV_API_BASE_URL = "http://localhost:3000/api";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.PROD ? `${window.location.origin}/api` : DEFAULT_DEV_API_BASE_URL);

export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthPayload {
  user: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string | null;
    status?: string;
  };
  access_token: string;
}

export type RelationshipStatus =
  | "self"
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "accepted";

interface UserLookupPayload {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string | null;
  status: string;
  relationship_status: RelationshipStatus;
}

interface ContactPayload extends UserLookupPayload {
  friendship_id: string;
}

interface ContactRequestPayload {
  request_id: string;
  requester_id: string;
  username: string;
  email?: string;
  avatar_url?: string | null;
  status: string;
  created_at: string;
}

interface MessagePayload {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: "sent" | "delivered" | "read";
  message_type: string;
  created_at: string;
}

interface MessageHistoryPayload {
  messages: MessagePayload[];
  has_more: boolean;
  next_cursor: string | null;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const maybeMessage = (payload as { message?: unknown }).message;
  if (typeof maybeMessage === "string") {
    return maybeMessage;
  }

  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) {
    return String(maybeMessage[0]);
  }

  return fallback;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `Request failed with status ${response.status}`),
      response.status
    );
  }

  return payload as ApiEnvelope<T>;
}

export const apiClient = {
  register(data: { username: string; password: string; email: string }) {
    return request<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { identifier: string; password: string }) {
    return request<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: data.identifier,
        password: data.password,
      }),
    });
  },

  getProfile(token: string) {
    return request<{
      id: string;
      username: string;
      email: string;
      avatar_url?: string | null;
      status: string;
    }>("/users/profile", {}, token);
  },

  updateProfile(
    token: string,
    data: {
      username?: string;
      email?: string;
      avatar_url?: string;
      status?: string;
    }
  ) {
    return request<{
      id: string;
      username: string;
      email: string;
      avatar_url?: string | null;
      status: string;
    }>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token);
  },

  getContacts(token: string) {
    return request<ContactPayload[]>("/contacts", {}, token);
  },

  addContact(
    token: string,
    data: { friendId?: string; friendUsername?: string }
  ) {
    return request<{ message: string }>("/contacts/add", {
      method: "POST",
      body: JSON.stringify({
        friend_id: data.friendId,
        friend_username: data.friendUsername,
      }),
    }, token);
  },

  getPendingContactRequests(token: string) {
    return request<ContactRequestPayload[]>("/contacts/requests", {}, token);
  },

  acceptContactRequest(token: string, requesterId: string) {
    return request<{ message: string }>("/contacts/accept", {
      method: "POST",
      body: JSON.stringify({ requester_id: requesterId }),
    }, token);
  },

  searchUsers(token: string, query: string) {
    return request<UserLookupPayload[]>(
      `/users/search?q=${encodeURIComponent(query)}`,
      {},
      token
    );
  },

  getUserSummary(token: string, userId: string) {
    return request<UserLookupPayload>(`/users/${userId}`, {}, token);
  },

  getMessageHistory(token: string, contactId: string, limit = 50, cursor?: string) {
    const search = new URLSearchParams({
      contact_id: contactId,
      limit: String(limit),
    });

    if (cursor) {
      search.set("cursor", cursor);
    }

    return request<MessageHistoryPayload>(`/messages/history?${search.toString()}`, {}, token);
  },
};

export type {
  AuthPayload,
  ContactPayload,
  ContactRequestPayload,
  UserLookupPayload,
  MessagePayload,
  MessageHistoryPayload,
};
