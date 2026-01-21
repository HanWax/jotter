# Task Queue

> Generated from PRD: Jotter Homepage. Each task is atomic and independently verifiable.

## Pending

### Phase 9: Database & API Updates for Homepage
- [ ] Task 52: Add isPinned boolean field to documents schema | Files: apps/api/src/db/schema.ts | Size: S
- [ ] Task 53: Add search endpoint for documents | Files: apps/api/src/routes/documents.ts | Size: S
- [ ] Task 54: Add query params support (pinned, sort, limit) to documents list | Files: apps/api/src/routes/documents.ts | Size: S

### Phase 10: Navbar Components
- [ ] Task 55: Create Navbar component with logo and navigation links | Files: apps/web/src/components/layout/Navbar.tsx | Size: M
- [ ] Task 56: Create UserMenu dropdown component | Files: apps/web/src/components/layout/UserMenu.tsx | Size: S
- [ ] Task 57: Create CreateDropdown component (New Document/Folder) | Files: apps/web/src/components/layout/CreateDropdown.tsx | Size: S
- [ ] Task 58: Create SearchBar component with results dropdown | Files: apps/web/src/components/layout/SearchBar.tsx | Size: M

### Phase 11: Homepage Document Components
- [ ] Task 59: Create DocumentCard component for grid view | Files: apps/web/src/components/documents/DocumentCard.tsx | Size: M
- [ ] Task 60: Create DocumentRow component for list view | Files: apps/web/src/components/documents/DocumentRow.tsx | Size: S
- [ ] Task 61: Create PinnedDocuments section component | Files: apps/web/src/components/homepage/PinnedDocuments.tsx | Size: M
- [ ] Task 62: Create RecentDocuments section with view toggle | Files: apps/web/src/components/homepage/RecentDocuments.tsx | Size: M
- [ ] Task 63: Create EmptyState component for new users | Files: apps/web/src/components/homepage/EmptyState.tsx | Size: S

### Phase 12: Homepage Integration
- [ ] Task 64: Create HomePage route component | Files: apps/web/src/routes/index.tsx | Size: M
- [ ] Task 65: Add useDocumentSearch hook | Files: apps/web/src/hooks/useDocumentSearch.ts | Size: S
- [ ] Task 66: Add usePinnedDocuments hook with pin/unpin mutation | Files: apps/web/src/hooks/usePinnedDocuments.ts | Size: S
- [ ] Task 67: Add view preference persistence (localStorage) | Files: apps/web/src/hooks/useViewPreference.ts | Size: S

### Phase 13: Responsive Design & Polish
- [ ] Task 68: Implement responsive navbar with mobile hamburger menu | Files: apps/web/src/components/layout/Navbar.tsx, MobileMenu.tsx | Size: M
- [ ] Task 69: Implement responsive homepage grid/list layouts | Files: apps/web/src/components/homepage/*.tsx | Size: M

## In Progress

(none)

## Completed

### Phase 1: Project Setup
- [x] Task 1: Initialize Turborepo monorepo with pnpm workspaces | Files: package.json, turbo.json, pnpm-workspace.yaml | Size: S
- [x] Task 2: Set up apps/web with Vite + React 18 | Files: apps/web/* | Size: M
- [x] Task 3: Set up apps/api with Cloudflare Workers + Hono | Files: apps/api/* | Size: M
- [x] Task 4: Set up packages/shared for types and Zod schemas | Files: packages/shared/* | Size: S
- [x] Task 5: Configure Tailwind CSS in web app | Files: apps/web/tailwind.config.js, postcss.config.js | Size: S
- [x] Task 6: Set up Drizzle ORM with Neon connection | Files: apps/api/src/db/* | Size: M
- [x] Task 7: Configure Clerk authentication (frontend) | Files: apps/web/src/lib/clerk.ts, main.tsx | Size: S
- [x] Task 8: Configure Clerk authentication (backend middleware) | Files: apps/api/src/middleware/auth.ts | Size: S

### Phase 2: Database & Core API
- [x] Task 9: Create Drizzle schema - users table | Files: apps/api/src/db/schema.ts | Size: S
- [x] Task 10: Create Drizzle schema - folders table | Files: apps/api/src/db/schema.ts | Size: S
- [x] Task 11: Create Drizzle schema - documents table | Files: apps/api/src/db/schema.ts | Size: S
- [x] Task 12: Create Drizzle schema - tags and document_tags tables | Files: apps/api/src/db/schema.ts | Size: S
- [x] Task 13: Create Drizzle schema - assets and document_assets tables | Files: apps/api/src/db/schema.ts | Size: S
- [x] Task 14: Create Drizzle schema - document_versions table | Files: apps/api/src/db/schema.ts | Size: S
- [x] Task 15: Create Drizzle schema - shares and comments tables | Files: apps/api/src/db/schema.ts | Size: S
- [x] Task 16: Implement document CRUD endpoints | Files: apps/api/src/routes/documents.ts | Size: M
- [x] Task 17: Implement folder CRUD endpoints | Files: apps/api/src/routes/folders.ts | Size: M
- [x] Task 18: Implement tag CRUD endpoints | Files: apps/api/src/routes/tags.ts | Size: S

### Phase 3: Frontend Core
- [x] Task 19: Set up TanStack Query client | Files: apps/web/src/lib/query.ts | Size: S
- [x] Task 20: Set up TanStack Router with routes | Files: apps/web/src/router.tsx, routes/* | Size: M
- [x] Task 21: Create API client with fetch wrapper | Files: apps/web/src/lib/api.ts | Size: S
- [x] Task 22: Build document list component | Files: apps/web/src/components/documents/DocumentList.tsx | Size: M
- [x] Task 23: Build folder tree sidebar | Files: apps/web/src/components/documents/FolderTree.tsx | Size: M
- [x] Task 24: Set up protected routes with Clerk | Files: apps/web/src/routes/* | Size: S
- [x] Task 25: Build document hooks (useDocuments, useDocument) | Files: apps/web/src/hooks/useDocuments.ts | Size: S

### Phase 4: Tiptap Editor
- [x] Task 26: Install and configure Tiptap with StarterKit | Files: apps/web/src/components/editor/Editor.tsx | Size: M
- [x] Task 27: Add Tiptap extensions (TaskList, Image, Link) | Files: apps/web/src/components/editor/extensions/* | Size: M
- [x] Task 28: Build editor toolbar component | Files: apps/web/src/components/editor/Toolbar.tsx | Size: M
- [x] Task 29: Implement autosave with debounced mutations | Files: apps/web/src/hooks/useAutosave.ts | Size: S
- [x] Task 30: Add document title editing | Files: apps/web/src/components/editor/TitleEditor.tsx | Size: S

### Phase 5: Asset Management
- [x] Task 31: Configure Cloudflare R2 in wrangler.toml | Files: apps/api/wrangler.toml | Size: S
- [x] Task 32: Implement presigned URL generation for uploads | Files: apps/api/src/routes/assets.ts | Size: M
- [x] Task 33: Build asset upload component with drag & drop | Files: apps/web/src/components/assets/AssetUploader.tsx | Size: M
- [x] Task 34: Build asset browser/gallery component | Files: apps/web/src/components/assets/AssetBrowser.tsx | Size: M
- [x] Task 35: Integrate asset insertion into Tiptap | Files: apps/web/src/components/editor/extensions/image.ts | Size: S
- [x] Task 36: Track document-asset relationships | Files: apps/api/src/routes/assets.ts | Size: S

### Phase 6: Publishing & Versions
- [x] Task 37: Implement publish endpoint | Files: apps/api/src/routes/documents.ts | Size: S
- [x] Task 38: Implement unpublish endpoint | Files: apps/api/src/routes/documents.ts | Size: S
- [x] Task 39: Build version history API | Files: apps/api/src/routes/versions.ts | Size: M
- [x] Task 40: Build version history UI | Files: apps/web/src/components/documents/VersionHistory.tsx | Size: M
- [x] Task 41: Implement version restore | Files: apps/api/src/routes/versions.ts | Size: S

### Phase 7: Sharing & Comments
- [x] Task 42: Implement share creation endpoint | Files: apps/api/src/routes/shares.ts | Size: M
- [x] Task 43: Build public shared document view | Files: apps/web/src/routes/shared.$token.tsx | Size: M
- [x] Task 44: Implement inline comment Tiptap extension | Files: apps/web/src/components/editor/extensions/comment.ts | Size: M
- [x] Task 45: Build comment thread UI | Files: apps/web/src/components/comments/CommentThread.tsx | Size: M
- [x] Task 46: Implement comment resolution workflow | Files: apps/api/src/routes/comments.ts | Size: S

### Phase 8: Polish & Deploy
- [x] Task 47: Add error handling and loading states | Files: apps/web/src/components/ui/* | Size: M
- [x] Task 48: Implement responsive design | Files: apps/web/src/styles/* | Size: M
- [x] Task 49: Configure Cloudflare Workers deployment | Files: apps/api/wrangler.toml | Size: S
- [x] Task 50: Configure frontend deployment (Pages/Vercel) | Files: apps/web/vercel.json or wrangler.toml | Size: S
- [x] Task 51: Set up environment variables for production | Files: .env.example, README.md | Size: S

## Failed (needs human intervention)

(none)
