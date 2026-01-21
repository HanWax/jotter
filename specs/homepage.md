# Feature: Homepage

> Central hub for users to access, organize, and create documents.

## Jobs To Be Done

### Document Access
- User can see recently edited documents when opening the app
- User can pin important documents for priority access
- User can toggle between grid and list views
- User can access any recent document within 2 clicks

### Navigation
- User can access all app sections (Documents, Folders, Tags, Assets) from navbar
- User can search for documents from the navbar
- User can see their profile and know they're logged in

### Document Creation
- User can create new documents or folders from anywhere via navbar
- New user sees clear call-to-action when they have no documents

## Requirements

### Top Navigation Bar
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

### User Profile Dropdown
- Settings
- Sign Out

### Pinned Documents Section
- Horizontal row or grid of pinned/favorite documents
- Shows: Title, folder location, published status badge
- Pin/unpin toggle on hover
- Empty state: "Pin documents for quick access"

### Recent Documents Section
- Default view: Card grid
- Toggle button: Grid / List view
- Shows per document: Title, last edited (relative), folder name, published status
- Card hover: subtle elevation/shadow
- Click navigates to document editor

### View Toggle
- Grid view: 3-4 cards per row, visual cards with preview
- List view: Table format with sortable columns (Title, Folder, Status, Last Edited)

### Empty State (New Users)
- Centered content area
- Heading: "Welcome to Jotter"
- Subtext: "Start capturing your ideas"
- Primary CTA button: "Create your first document"

### Search (P1)
- Search input in navbar
- Searches document titles
- Results dropdown as user types
- Press Enter for full search results page

## Acceptance Criteria

- [ ] Homepage loads in < 2 seconds
- [ ] Search results appear within 300ms of typing
- [ ] Full keyboard navigation support
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Responsive: Desktop (3-4 col), Tablet (2 col), Mobile (1 col + hamburger)
- [ ] All API calls authenticated via Clerk JWT

## Backlog (Not Yet Implemented)

### P1: Should Have
- [x] Full-text content search (commit: ebd749f)
- [x] Keyboard shortcuts (Cmd+K for search, Cmd+N for new doc)

### P2: Could Have
- [ ] Recent searches in search dropdown
- [ ] Document thumbnails in grid view
- [ ] Bulk selection and actions in list view
- [ ] Document preview on hover
- [ ] Drag-and-drop reordering of pinned documents

## Out of Scope

- Activity feed / timeline
- Collaborative features (shared with me section)
- Analytics dashboard
- AI-powered suggestions
- Custom homepage layouts
- Widgets or dashboard customization
- Notifications center
- Team/collaboration features

## Technical Notes

### Components
- `Navbar.tsx` - Top navigation
- `HomePage.tsx` - Homepage route
- `DocumentCard.tsx` - Grid view card
- `DocumentRow.tsx` - List view row
- `PinnedDocuments.tsx` - Pinned section
- `RecentDocuments.tsx` - Recent section with view toggle
- `CreateDropdown.tsx` - New document/folder dropdown
- `SearchBar.tsx` - Navbar search
- `UserMenu.tsx` - Profile dropdown
- `EmptyState.tsx` - New user welcome

### API Endpoints
- `GET /api/documents?pinned=true` - Fetch pinned documents
- `GET /api/documents?sort=updatedAt&limit=20` - Fetch recent documents
- `PATCH /api/documents/:id` - Update pinned status
- `GET /api/documents/search?q=query` - Search documents

### State
- View preference (grid/list) - localStorage
- Pinned documents - server-side, user preference
