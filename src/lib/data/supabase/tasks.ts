import type { Task } from '@/lib/types';
import type { TaskRepository } from '../repository';

export class SupabaseTaskRepository implements TaskRepository {
  async getTasks(): Promise<Task[]> {
    throw new Error('SupabaseTaskRepository.getTasks not implemented.');
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    throw new Error(`SupabaseTaskRepository.getTasksByAssignee not implemented for user ${userId}.`);
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    throw new Error(`SupabaseTaskRepository.getTaskById not implemented for id ${id}.`);
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    throw new Error(`SupabaseTaskRepository.createTask not implemented for task ${task.title}.`);
  }
  
  async updateTask(id: string, task: Partial<Task>): Promise<Task | undefined> {
    throw new Error(`SupabaseTaskRepository.updateTask not implemented for task ${id} ${task.title}.`);
  }

  async deleteTask(id: string): Promise<void> {
    throw new Error(`SupabaseTaskRepository.deleteTask not implemented for id ${id}.`);
  }
}
