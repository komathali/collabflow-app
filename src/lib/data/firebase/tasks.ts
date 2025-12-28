import type { Task } from '@/lib/types';
import { MOCK_TASKS, MOCK_USERS } from '../mock-data';
import type { TaskRepository } from '../repository';

// This is a mock implementation using local data.
// In a real app, this would interact with Firestore.
export class FirebaseTaskRepository implements TaskRepository {
  private tasks: Task[] = MOCK_TASKS;
  private users = MOCK_USERS;

  async getTasks(): Promise<Task[]> {
    console.log('Fetching tasks from Firebase (mock)...');
    return Promise.resolve(this.tasks);
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    console.log(`Fetching tasks for user ${userId} from Firebase (mock)...`);
    // Assuming 'user-1' is the current user for demonstration
    const currentUser = this.users.find(u => u.id === 'user-1');
    return Promise.resolve(this.tasks.filter(t => t.assignee?.id === currentUser?.id));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return Promise.resolve(this.tasks.find(t => t.id === id));
  }

  async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
    };
    this.tasks.push(newTask);
    return Promise.resolve(newTask);
  }

  async updateTask(id: string, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskUpdate };
      return Promise.resolve(this.tasks[taskIndex]);
    }
    return Promise.resolve(undefined);
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks = this.tasks.filter(t => t.id !== id);
    return Promise.resolve();
  }
}
