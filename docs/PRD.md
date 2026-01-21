# Jotter Homepage - Product Requirements Document

## Overview

### Product Summary
A feature-rich homepage for Jotter that serves as the central hub for users to access, organize, and create their documents. The homepage prioritizes recent document access while providing comprehensive navigation to all app features.

### Target Users
- Individual users managing personal notes, ideas, and documents
- Users who work with multiple documents and need quick access to recent work
- Users who organize content with folders and tags

### Key Value Proposition
Instant access to recent work with powerful organization tools, all accessible from a clean top navigation bar.

---

## Goals

### Primary Objectives
1. Provide immediate access to recently edited documents
2. Enable quick document and folder creation from anywhere
3. Surface pinned/favorite documents for priority access
4. Offer intuitive navigation to all app features (Documents, Folders, Tags, Assets)

### Success Criteria
- Users can access any recent document within 2 clicks
- New document creation is possible from any page via navbar
- Users can quickly find documents via search
- Clear visual hierarchy guides users to primary actions

---

## User Stories

### Document Access
- **As a user**, I want to see my recently edited documents when I open the app, so that I can quickly resume my work.
- **As a user**, I want to pin important documents, so that they appear at the top of my homepage regardless of edit date.
- **As a user**, I want to toggle between grid and list views, so that I can view documents in my preferred format.

### Navigation
- **As a user**, I want a top navigation bar with all main sections, so that I can access any part of the app quickly.
- **As a user**, I want to search for documents from the navbar, so that I can find specific content without leaving my current page.
- **As a user**, I want to see my profile and name in the navbar, so that I know I'm logged into the correct account.

### Document Creation
- **As a user**, I want a dropdown menu to create new documents or folders, so that I can quickly start organizing my work.
- **As a new user**, I want a clear call-to-action when I have no documents, so that I know how to get started.

---

## Functional Requirements

### Must Have (P0)

#### Top Navigation Bar
| Element | Description |
|---------|-------------|
| Logo/Brand | Jotter logo, links to homepage |
| Documents | Link to full documents list |
| Folders | Link to folders view |
| Tags | Link to tags management |
| Assets | Link to asset library/gallery |
| Search | Simple text search input |
| Create Dropdown | "New" button with dropdown: New Document, New Folder |
| User Profile | Avatar + user name, clickable for dropdown menu |

#### User Profile Dropdown
- Settings
- Sign Out

#### Homepage Content Area

**Pinned Documents Section**
- Horizontal row or grid of pinned/favorite documents
- Shows: Title, folder location, published status badge
- Pin/unpin toggle on hover
- Empty state: "Pin documents for quick access"

**Recent Documents Section**
- Default view: Card grid
- Toggle button: Grid / List view
- Shows per document:
  - Title
  - Last edited date (relative: "2 hours ago")
  - Folder name (if any)
  - Published status badge (green "Published" or gray "Draft")
- Card hover: subtle elevation/shadow
- Click navigates to document editor

#### View Toggle
- Grid view: 3-4 cards per row, visual cards with preview
- List view: Table format with sortable columns

#### Empty State (New Users)
- Centered content area
- Heading: "Welcome to Jotter"
- Subtext: "Start capturing your ideas"
- Primary CTA button: "Create your first document"

### Should Have (P1)

#### Search Functionality
- Search input in navbar
- Searches document titles (initially)
- Results dropdown as user types
- Press Enter to go to full search results page

#### Document Cards (Grid View)
- Title (truncated if long)
- Content preview snippet (first ~100 chars)
- Folder badge
- Published status indicator
- Last edited timestamp

#### Document Rows (List View)
| Column | Sortable |
|--------|----------|
| Title | Yes |
| Folder | Yes |
| Status | Yes |
| Last Edited | Yes (default) |

### Could Have (P2)

- Keyboard shortcuts (Cmd+K for search, Cmd+N for new doc)
- Recent searches in search dropdown
- Document thumbnails in grid view
- Bulk selection and actions in list view

### Won't Have (This Phase)

- Activity feed / timeline
- Collaborative features (shared with me section)
- Analytics dashboard
- AI-powered suggestions

---

## Non-Functional Requirements

### Performance
- Homepage loads in < 2 seconds on standard connection
- Search results appear within 300ms of typing
- Smooth transitions between grid/list views

### Accessibility
- Full keyboard navigation support
- ARIA labels on interactive elements
- Color contrast meets WCAG AA standards
- Focus indicators on all interactive elements

### Responsive Design
- Desktop: Full navbar, 3-4 column grid
- Tablet: Condensed navbar, 2 column grid
- Mobile: Hamburger menu, single column list

### Security
- All API calls authenticated via Clerk JWT
- No sensitive data exposed in URL parameters

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first document (new users) | < 30 seconds |
| Click-through rate on recent documents | > 60% |
| Search usage rate | > 25% of sessions |
| Pin feature adoption | > 15% of users |

---

## Technical Considerations

### Components to Create/Modify
1. `Navbar.tsx` - New top navigation component
2. `HomePage.tsx` - New homepage route component
3. `DocumentCard.tsx` - Card component for grid view
4. `DocumentRow.tsx` - Row component for list view
5. `PinnedDocuments.tsx` - Pinned section component
6. `RecentDocuments.tsx` - Recent section with view toggle
7. `CreateDropdown.tsx` - New document/folder dropdown
8. `SearchBar.tsx` - Navbar search component
9. `UserMenu.tsx` - Profile dropdown component
10. `EmptyState.tsx` - New user welcome state

### API Endpoints Needed
- `GET /api/documents?pinned=true` - Fetch pinned documents
- `GET /api/documents?sort=updatedAt&limit=20` - Fetch recent documents
- `PATCH /api/documents/:id` - Update pinned status
- `GET /api/documents/search?q=query` - Search documents

### State Management
- View preference (grid/list) - localStorage
- Pinned documents - server-side, user preference

---

## Wireframe Description

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Documents  Folders  Tags  Assets  [🔍 Search...]  [+ New ▼]  👤 Name │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📌 Pinned                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                                   │
│  │ Doc 1   │ │ Doc 2   │ │ Doc 3   │                                   │
│  │ Folder  │ │ Folder  │ │ Draft   │                                   │
│  └─────────┘ └─────────┘ └─────────┘                                   │
│                                                                         │
│  Recent Documents                              [Grid] [List]            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │         │ │         │ │         │ │         │                       │
│  │ Title   │ │ Title   │ │ Title   │ │ Title   │                       │
│  │ Preview │ │ Preview │ │ Preview │ │ Preview │                       │
│  │ 2h ago  │ │ 1d ago  │ │ 3d ago  │ │ 1w ago  │                       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Open Questions

1. Should pinned documents sync across devices or be device-specific?
2. How many recent documents should be shown before pagination/load more?
3. Should there be a "View All" link for each section?
4. What happens when search returns no results - suggest creation?

---

## Out of Scope

- Full-text content search (title search only for now)
- Document preview on hover
- Drag-and-drop reordering of pinned documents
- Custom homepage layouts
- Widgets or dashboard customization
- Notifications center
- Team/collaboration features

---

## Milestones

1. **Milestone 1**: Navbar with navigation links and user profile
2. **Milestone 2**: Recent documents section with grid/list toggle
3. **Milestone 3**: Pinned documents section with pin/unpin functionality
4. **Milestone 4**: Create dropdown menu (New Document, New Folder)
5. **Milestone 5**: Search bar with basic document title search
6. **Milestone 6**: Empty state for new users
7. **Milestone 7**: Responsive design adjustments
