import type { Task, User } from '@/lib/types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=user-1' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'Member', avatarUrl: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Member', avatarUrl: 'https://i.pravatar.cc/150?u=user-3' },
  { id: 'user-4', name: 'Diana Prince', email: 'diana@example.com', role: 'Guest', avatarUrl: 'https://i.pravatar.cc/150?u=user-4' },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design the new landing page',
    status: 'In Progress',
    priority: 'High',
    assignee: MOCK_USERS[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    tags: ['design', 'web'],
    projectId: 'proj-1',
  },
  {
    id: 'task-2',
    title: 'Develop the authentication flow',
    status: 'To-Do',
    priority: 'Urgent',
    assignee: MOCK_USERS[1],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    tags: ['development', 'auth'],
    projectId: 'proj-1',
  },
  {
    id: 'task-3',
    title: 'Setup CI/CD pipeline',
    status: 'Done',
    priority: 'High',
    assignee: MOCK_USERS[2],
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    tags: ['devops'],
    projectId: 'proj-1',
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    status: 'In Review',
    priority: 'Medium',
    assignee: MOCK_USERS[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    tags: ['documentation'],
    projectId: 'proj-2',
  },
    {
    id: 'task-5',
    title: 'User testing for the new feature',
    status: 'To-Do',
    priority: 'Medium',
    assignee: MOCK_USERS[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    tags: ['testing', 'feedback'],
    projectId: 'proj-2',
  },
];
