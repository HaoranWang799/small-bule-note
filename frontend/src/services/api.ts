// API 配置 - 自动根据环境选择 API 基础 URL

const API_BASE_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://small-bule-note-production.up.railway.app/api'
    : 'http://localhost:3000/api';

export const apiClient = {
  // 认证 API
  register: (data: { username: string; password: string; email: string }) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  login: (data: { username: string; password: string }) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // 用户 API
  getProfile: (token: string) =>
    fetch(`${API_BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.json()),

  updateProfile: (token: string, data: any) =>
    fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // 联系人 API
  getContacts: (token: string) =>
    fetch(`${API_BASE_URL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.json()),

  addContact: (token: string, friendUsername: string) =>
    fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ friendUsername }),
    }).then(r => r.json()),

  // 消息 API
  getMessageHistory: (token: string, contactId: string, limit: number = 50) =>
    fetch(`${API_BASE_URL}/messages/history?contactId=${contactId}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.json()),

  sendMessage: (token: string, data: { receiverId: string; content: string }) =>
    fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),
};

// WebSocket 连接
export const connectWebSocket = (token: string, userId: string) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = 
    process.env.NODE_ENV === 'production'
      ? 'small-bule-note-production.up.railway.app'
      : 'localhost:3000';
  
  const socket = new WebSocket(`${protocol}//${host}?token=${token}`);
  return socket;
};
