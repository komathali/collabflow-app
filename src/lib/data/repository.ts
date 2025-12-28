import type { Task, Project } from '@/lib/types';

export interface TaskRepository {
  getTasks(): Promise<Task[]>;
  getTasksByAssignee(userId: string): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | undefined>;
  createTask(task: Omit<Task, 'id'>): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
}

export interface ProjectRepository {
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
}
