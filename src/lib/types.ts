import { User as FirebaseAuthUser } from 'firebase/auth';

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
  ownerId: string;
  memberIds: string[];
  createdAt: string;
};

export type TaskStatus = 'To-Do' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
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

// Data Service Interface
export interface IDataService {
  // Auth
  login(email: string, password: string): Promise<FirebaseAuthUser | null>;
  logout(): Promise<void>;
  signUp(email: string, password: string, displayName: string): Promise<FirebaseAuthUser | null>
  getUser(): Promise<FirebaseAuthUser | null>;
  onAuthStateChange(callback: (user: FirebaseAuthUser | null) => void): () => void;

  // Data
  getProjects(): Promise<Project[]>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'ownerId' | 'memberIds'>): Promise<Project>;
}
