import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class UiController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getUi(): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IM MVP Demo</title>
    <style>
      :root {
        --bg: #f5f3ef;
        --card: #fffdf8;
        --line: #d7d2c8;
        --text: #1f1e1b;
        --muted: #6e6a61;
        --accent: #0f766e;
        --danger: #b91c1c;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--text);
        background:
          radial-gradient(circle at 20% 10%, #ffffff 0%, #f7f1e8 40%, #efe8db 100%);
      }
      .wrap {
        max-width: 1100px;
        margin: 24px auto;
        padding: 0 16px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
      }
      .full { grid-column: 1 / -1; }
      h1 { margin: 0 0 8px; font-size: 28px; }
      h2 { margin: 0 0 12px; font-size: 20px; }
      p { margin: 0 0 8px; color: var(--muted); }
      label { display: block; font-size: 14px; margin: 8px 0 4px; }
      input, textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 10px;
        font: inherit;
        background: #fff;
      }
      textarea { min-height: 100px; }
      .row { display: flex; gap: 8px; }
      .row > * { flex: 1; }
      button {
        margin-top: 10px;
        border: 0;
        border-radius: 8px;
        padding: 10px 12px;
        cursor: pointer;
        background: var(--accent);
        color: #fff;
        font-weight: 600;
      }
      button.secondary { background: #334155; }
      .log {
        background: #111827;
        color: #e5e7eb;
        border-radius: 8px;
        padding: 10px;
        min-height: 140px;
        white-space: pre-wrap;
        overflow: auto;
      }
      .ok { color: var(--accent); }
      .err { color: var(--danger); }
      @media (max-width: 900px) {
        .wrap { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card full">
        <h1>IM MVP Web Demo</h1>
        <p>API Base: <span id="base"></span></p>
        <p>Use this page to test register/login/profile/history/WebSocket quickly.</p>
      </div>

      <div class="card">
        <h2>Register</h2>
        <label>Username</label><input id="regUsername" value="user_a" />
        <label>Email</label><input id="regEmail" value="user_a@example.com" />
        <label>Password</label><input id="regPassword" type="password" value="12345678" />
        <button onclick="register()">Register</button>
      </div>

      <div class="card">
        <h2>Login</h2>
        <label>Username</label><input id="loginUsername" value="user_a" />
        <label>Password</label><input id="loginPassword" type="password" value="12345678" />
        <button onclick="login()">Login</button>
        <p>Token saved locally after login.</p>
      </div>

      <div class="card">
        <h2>Profile</h2>
        <button class="secondary" onclick="getProfile()">GET /users/profile</button>
        <label>New status</label><input id="newStatus" value="online" />
        <button onclick="updateProfile()">PATCH /users/profile</button>
      </div>

      <div class="card">
        <h2>Messages</h2>
        <label>Contact ID</label><input id="contactId" placeholder="uuid" />
        <button class="secondary" onclick="history()">GET /messages/history</button>
      </div>

      <div class="card full">
        <h2>WebSocket</h2>
        <div class="row">
          <button onclick="connectWs()">Connect WS</button>
          <button class="secondary" onclick="disconnectWs()">Disconnect WS</button>
        </div>
        <label>Receiver ID</label><input id="receiverId" placeholder="uuid" />
        <label>Message</label><input id="msgText" value="hello from web demo" />
        <button onclick="sendWsMessage()">Send message:send</button>
      </div>

      <div class="card full">
        <h2>Logs</h2>
        <div class="log" id="log"></div>
      </div>
    </div>

    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script>
      const base = window.location.origin + '/api';
      document.getElementById('base').textContent = base;

      let token = localStorage.getItem('im_token') || '';
      let socket = null;

      function writeLog(title, data, isError = false) {
        const el = document.getElementById('log');
        const time = new Date().toISOString();
        const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        el.innerHTML += '\\n[' + time + '] ' + title + '\\n' + text + '\\n';
        if (isError) {
          el.innerHTML += '[ERROR]\\n';
        }
        el.scrollTop = el.scrollHeight;
      }

      async function api(path, options = {}) {
        const headers = {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        };
        if (token) headers.Authorization = 'Bearer ' + token;
        const res = await fetch(base + path, { ...options, headers });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw data;
        return data;
      }

      async function register() {
        try {
          const body = {
            username: document.getElementById('regUsername').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
          };
          const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(body) });
          writeLog('REGISTER OK', data);
        } catch (e) {
          writeLog('REGISTER ERR', e, true);
        }
      }

      async function login() {
        try {
          const body = {
            username: document.getElementById('loginUsername').value,
            password: document.getElementById('loginPassword').value,
          };
          const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(body) });
          token = data?.data?.access_token || '';
          localStorage.setItem('im_token', token);
          writeLog('LOGIN OK', { tokenPreview: token ? token.slice(0, 24) + '...' : '' });
        } catch (e) {
          writeLog('LOGIN ERR', e, true);
        }
      }

      async function getProfile() {
        try {
          const data = await api('/users/profile');
          writeLog('PROFILE OK', data);
        } catch (e) {
          writeLog('PROFILE ERR', e, true);
        }
      }

      async function updateProfile() {
        try {
          const body = { status: document.getElementById('newStatus').value };
          const data = await api('/users/profile', { method: 'PATCH', body: JSON.stringify(body) });
          writeLog('UPDATE PROFILE OK', data);
        } catch (e) {
          writeLog('UPDATE PROFILE ERR', e, true);
        }
      }

      async function history() {
        try {
          const id = document.getElementById('contactId').value;
          const data = await api('/messages/history?contact_id=' + encodeURIComponent(id));
          writeLog('HISTORY OK', data);
        } catch (e) {
          writeLog('HISTORY ERR', e, true);
        }
      }

      function connectWs() {
        try {
          if (!token) {
            writeLog('WS ERR', 'Please login first', true);
            return;
          }
          socket = io(window.location.origin, {
            transports: ['websocket'],
            auth: { token },
          });

          socket.on('connect', () => writeLog('WS CONNECT', { id: socket.id }));
          socket.on('connected', (d) => writeLog('WS CONNECTED', d));
          socket.on('message:receive', (d) => writeLog('WS RECEIVE', d));
          socket.on('message:sent', (d) => writeLog('WS SENT ACK', d));
          socket.on('pong', (d) => writeLog('WS PONG', d));
          socket.on('error', (d) => writeLog('WS ERROR', d, true));

          setInterval(() => {
            if (socket && socket.connected) socket.emit('ping');
          }, 30000);
        } catch (e) {
          writeLog('WS CONNECT ERR', e, true);
        }
      }

      function disconnectWs() {
        if (socket) {
          socket.disconnect();
          socket = null;
          writeLog('WS DISCONNECT', 'done');
        }
      }

      function sendWsMessage() {
        if (!socket || !socket.connected) {
          writeLog('WS ERR', 'Socket not connected', true);
          return;
        }
        const payload = {
          receiver_id: document.getElementById('receiverId').value,
          content: document.getElementById('msgText').value,
          message_type: 'text',
        };
        socket.emit('message:send', payload);
        writeLog('WS SEND', payload);
      }

      writeLog('READY', 'Demo page loaded');
    </script>
  </body>
</html>`;
  }
}
