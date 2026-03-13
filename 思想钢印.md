---

## 2026-03-14

### Feature / Fix
Backend switched to API-only mode to enforce single frontend entry

### Files Modified
- backend/src/main.ts
- backend/src/app.module.ts

### Description
Removed backend static frontend hosting and SPA fallback handling. Also removed `UiController` registration from the application module so the backend service no longer serves website UI pages and focuses on API/WebSocket responsibilities.

### API Changes
No endpoint contract changes under `/api/*`. Non-API root UI page serving on backend was removed.

### Database Changes
None.

### Notes
Use the dedicated frontend Railway service/domain as the primary web entry. Keep backend domain for API and socket traffic only to avoid dual-entry confusion.

---
