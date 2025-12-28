
import type { Task, User, Project } from '@/lib/types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=user-1' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'Member', avatarUrl: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Member', avatarUrl: 'https://i.pravatar.cc/150?u=user-3' },
  { id: 'user-4', name: 'Diana Prince', email: 'diana@example.com', role: 'Guest', avatarUrl: 'https://i.pravatar.cc/150?u=user-4' },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-1',
        name: 'CollabFlow Website Redesign',
        description: 'A complete overhaul of the marketing website and brand identity.',
        ownerId: 'user-1',
        memberIds: ['user-1', 'user-2', 'user-3'],
        createdAt: new Date('2023-01-15').toISOString(),
        startDate: new Date('2023-02-01').toISOString(),
        endDate: new Date('2023-06-30').toISOString(),
    },
    {
        id: 'proj-2',
        name: 'Mobile App Development',
        description: 'Creating native iOS and Android apps for our platform.',
        ownerId: 'user-2',
        memberIds: ['user-1', 'user-2', 'user-4'],
        createdAt: new Date('2023-03-01').toISOString(),
        startDate: new Date('2023-04-01').toISOString(),
        endDate: new Date('2023-12-31').toISOString(),
    }
]

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design the new landing page',
    status: 'In Progress',
    priority: 'High',
    assigneeId: 'user-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    tags: ['design', 'web'],
    projectId: 'proj-1',
    isMilestone: true,
  },
  {
    id: 'task-2',
    title: 'Develop the authentication flow',
    status: 'To-Do',
    priority: 'Urgent',
    assigneeId: 'user-2',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    tags: ['development', 'auth'],
    projectId: 'proj-1',
  },
  {
    id: 'task-3',
    title: 'Setup CI/CD pipeline',
    status: 'Done',
    priority: 'High',
    assigneeId: 'user-2',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    tags: ['devops'],
    projectId: 'proj-1',
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    status: 'In Review',
    priority: 'Medium',
    assigneeId: 'user-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    tags: ['documentation'],
    projectId: 'proj-2',
  },
    {
    id: 'task-5',
    title: 'User testing for the new feature',
    status: 'To-Do',
    priority: 'Medium',
    assigneeId: 'user-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    tags: ['testing', 'feedback'],
    projectId: 'proj-2',
  },
   {
    id: 'task-6',
    title: 'Finalize brand style guide',
    status: 'Done',
    priority: 'High',
    assigneeId: 'user-1',
    dueDate: new Date('2023-03-15').toISOString(),
    tags: ['design', 'branding'],
    projectId: 'proj-1',
    isMilestone: true,
  },
  {
    id: 'task-7',
    title: 'Launch native mobile app beta',
    status: 'To-Do',
    priority: 'Urgent',
    assigneeId: 'user-2',
    dueDate: new Date('2023-11-01').toISOString(),
    tags: ['mobile', 'release'],
    projectId: 'proj-2',
    isMilestone: true,
  }
];
