# TEST REPORT

## Test Date
2026-03-14

## Test Environment
- Execution mode: end-to-end regression against active Railway services
- Backend: `https://small-bule-note-production.up.railway.app`
- Frontend: `https://frontend-production-4c75.up.railway.app`
- Note: local Docker engine was unavailable, so PostgreSQL/Redis local startup tests were blocked

## Test Scope
1. User authentication
2. Contacts system
3. Chat and message history
4. User profile
5. API error handling
6. WebSocket connect/send/receive/reconnect
7. UI page smoke tests
8. Exception behavior (within available environment constraints)

## Passed Functions
- Auth API: register/login happy path and invalid input paths
- Contacts API: add request, duplicate add rejection, accept request, list contacts, remove contact
- Profile API: get profile and update profile
- History API: message persistence and pagination (`limit`, `cursor`) behavior
- WebSocket: connect, send, receive, reconnect, no duplicate delivery in idle window
- Health API: Redis status check returns `checks.redis = connected`
- UI pages: login, register, chats, contacts, add-friend search, profile, edit-profile

## Issues Found
1. Direct visit `/chats` rendered a blank page for unauthenticated users.
2. Chat page route parameter mismatch caused `Chat Not Found` (`/chat/:contactId` vs `id`).
3. Non-friend direct chat showed `Chat Not Found` before async target loading completed.
4. Profile `Settings` button had no navigation behavior.
5. WebSocket `message:send` returned internal error when `client_message_id` was non-UUID.

## Fixes Implemented
1. Added global auth initialization and robust unauth redirect behavior for tab layout.
2. Fixed chat route param parsing to use `contactId`.
3. Added loading state during `openChat` target resolution in chat screen.
4. Wired profile `Settings` button to `/edit-profile`.
5. Added UUID guard before DB lookup for `client_message_id` dedup path.

## Re-test Results After Fixes
- `/chats` now redirects to `/login` without blank screen.
- `Add Friend -> Direct Chat` opens chat page successfully for non-friends.
- Profile `Settings` opens edit profile page; save flow updates username/status and returns to profile.
- WebSocket with non-UUID `client_message_id` now acknowledges and delivers without server error.

## Unresolved / Limited
- True local infra fault injection (`server down`, `Redis down`, `DB down`) was not executed locally because Docker engine was unavailable on this machine.
- Deployment config still shows backend service building both backend+frontend when deployed from root, which increases build time.
- Contact removal followed by history query currently returns `200` instead of access-denied semantics; behavior is stable but product expectation should be clarified.

## Improvement Suggestions
1. Add automated API+WebSocket regression scripts to CI.
2. Split backend build from root deploy path to reduce deployment time.
3. Define product policy for history access after friendship removal and enforce it consistently.
4. Add UI E2E smoke tests (Playwright) for auth, direct chat, and profile edit.
