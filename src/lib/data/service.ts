import { FirebaseTaskRepository } from './firebase/tasks';
// In a real app, this could be determined by an environment variable
// to switch between Firebase and Supabase implementations.
// For now, we default to the Firebase implementation.

export const taskService = new FirebaseTaskRepository();
