You are a senior mobile product designer and frontend architect.

Design a complete mobile UI and frontend component architecture for a WeChat-like Instant Messaging App MVP.

The UI must match the backend API structure exactly and be optimized for React Native development.

Backend stack:

NestJS
PostgreSQL
Redis
WebSocket

Core modules:

Auth
Chat
Contacts
Profile

--------------------------------------------------

DESIGN STYLE

Design inspiration:

WeChat
WhatsApp
Telegram

Goals:

Minimal
Clean
Fast to implement
Component-based
Developer friendly

--------------------------------------------------

COLOR SYSTEM

Primary

#07C160

Background

#FFFFFF

Secondary background

#F5F5F5

Border

#E5E5E5

Text

#111111

Online indicator

#2ECC71

Offline indicator

#BDC3C7

--------------------------------------------------

TYPOGRAPHY

Title 18
Body 16
Caption 13

Use system fonts.

--------------------------------------------------

NAVIGATION STRUCTURE

Bottom Tab Navigation

Tabs:

Chats
Contacts
Profile

Authentication screens appear before tabs.

--------------------------------------------------

SCREEN 1

SPLASH SCREEN

Logo centered.

App name:

IM Messenger

Auto redirect to login if user not authenticated.

--------------------------------------------------

SCREEN 2

LOGIN SCREEN

Fields:

Email
Password

Buttons:

Login
Register

API

POST /auth/login

On success:

store JWT
connect WebSocket
navigate to Chat List.

--------------------------------------------------

SCREEN 3

REGISTER SCREEN

Fields:

Username
Email
Password

Button:

Register

API

POST /auth/register

After register redirect to login.

--------------------------------------------------

SCREEN 4

CHAT LIST SCREEN

Title

Chats

List of conversations.

Each row contains:

Avatar
Username
Last message
Timestamp
Unread badge

Click item → open Chat Screen.

--------------------------------------------------

SCREEN 5

CHAT SCREEN

Top bar

Back button
Avatar
Username
Online status indicator

Message area

Display messages in bubbles.

Left side = received messages
Right side = sent messages

Message data:

content
timestamp
status

Status icons:

sent
delivered
read

Bottom input bar

Text input
Send button

When user presses send:

Send message via WebSocket event "sendMessage".

--------------------------------------------------

SCREEN 6

CONTACTS LIST

Title

Contacts

List of friends.

Each row contains:

Avatar
Username
Online indicator

Click contact → open chat.

Floating action button:

Add Friend

--------------------------------------------------

SCREEN 7

ADD FRIEND SCREEN

Input:

Username

Button:

Add Friend

API

POST /contacts/add

--------------------------------------------------

SCREEN 8

PROFILE SCREEN

Display:

Avatar
Username
Email

Buttons:

Edit Profile
Logout

API

GET /users/profile

--------------------------------------------------

SCREEN 9

EDIT PROFILE SCREEN

Fields:

Avatar upload
Username
Email

Button:

Save

API

PATCH /users/profile

--------------------------------------------------

COMPONENT SYSTEM

Create reusable UI components:

Avatar
MessageBubble
ChatListItem
ContactItem
InputBar
UnreadBadge
OnlineIndicator
Button
InputField

--------------------------------------------------

FRONTEND ARCHITECTURE

React Native project structure

src

screens

SplashScreen
LoginScreen
RegisterScreen
ChatListScreen
ChatScreen
ContactsScreen
AddFriendScreen
ProfileScreen
EditProfileScreen

components

Avatar
MessageBubble
ChatItem
ContactItem
InputBar
Button
InputField

services

api.ts
socket.ts
auth.ts

store

userStore
chatStore
contactStore

--------------------------------------------------

API CLIENT

Central API client.

Endpoints:

POST /auth/login
POST /auth/register
GET /users/profile
PATCH /users/profile
GET /contacts
POST /contacts/add
DELETE /contacts/remove
GET /messages/history

--------------------------------------------------

WEBSOCKET CLIENT

Use socket.io-client.

Connection logic:

Connect socket after login.

Events:

connect
disconnect
receiveMessage
typing

Send message event:

sendMessage

--------------------------------------------------

STATE MANAGEMENT

Use Zustand.

Store:

currentUser
friends
messages
socketStatus

--------------------------------------------------

FIGMA REQUIREMENTS

Produce:

Full mobile UI screens
Component library
Spacing system
Icon placeholders
Developer annotations

All components must map to React Native components.

--------------------------------------------------

FINAL OUTPUT

Generate:

1 complete mobile UI system
2 component library
3 layout grid
4 developer handoff documentation
5 frontend architecture matching backend APIs