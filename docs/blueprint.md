# **App Name**: CollabFlow

## Core Features:

- Data Service Abstraction: Implement a repository/adapter pattern using a DataService interface for Firebase and Supabase.
- Project Table View: Dynamic table view supporting CRUD operations, custom columns and inline editing, implemented using @tanstack/react-table.
- Kanban Board: Drag-and-drop Kanban board using @dnd-kit/core to manage task statuses.
- Personal Dashboard: Widget-based 'Me View' dashboard with 'My Tasks', 'My Agenda' and 'Private Sticky Notes'.
- Project Overview: Bird's-eye view of project progress, activity log and milestones.
- Real-Time Chat: In-app chat using Firestore listeners, supporting file uploads to Firebase Storage.
- Meeting Summary Generator: Generate summaries of meeting discussions. A tool summarizes discussions to identify key decisions and next steps.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to convey professionalism and stability.
- Background color: Light gray (#F5F5F5), subtly desaturated from the primary hue.
- Accent color: Violet (#9C27B0) for interactive elements and highlights.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a clean, modern aesthetic. Suitable for both headlines and body text.
- Use minimalist icons from a library like Material Icons for a consistent look.
- Sidebar navigation for main sections and a clean, grid-based layout.
- Subtle transitions and loading animations for a smooth user experience.