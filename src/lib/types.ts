export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Admin' | 'Member' | 'Guest';
};

export type Project = {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdAt: string;
};

export type TaskStatus = 'To-Do' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  dueDate?: string;
  tags: string[];
  projectId: string;
};

export type ActivityLog = {
  id: string;
  user: User;
  action: string;
  timestamp: string;
  details: string;
};
