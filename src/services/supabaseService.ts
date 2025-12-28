
import { IDataService, Project, Task, User } from "@/lib/types";
import { User as FirebaseAuthUser } from "firebase/auth";

class SupabaseService implements IDataService {
  login(email: string, password: string): Promise<FirebaseAuthUser | null> {
    throw new Error("Method not implemented.");
  }
  logout(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  signUp(email: string, password: string, displayName: string): Promise<FirebaseAuthUser | null> {
    throw new Error("Method not implemented.");
  }
  getUser(): Promise<FirebaseAuthUser | null> {
    throw new Error("Method not implemented.");
  }
  onAuthStateChange(callback: (user: FirebaseAuthUser | null) => void): () => void {
    throw new Error("Method not implemented.");
  }
  getUsers(): Promise<User[]> {
      throw new Error("Method not implemented.");
  }
  getProjects(): Promise<Project[]> {
    throw new Error("Method not implemented.");
  }
  getProjectById(id: string): Promise<Project | undefined> {
    throw new Error("Method not implemented.");
  }
  createProject(project: Omit<Project, "id" | "createdAt" | "ownerId" | "memberIds">): Promise<Project> {
    throw new Error("Method not implemented.");
  }
  updateProject(id: string, project: Partial<Project>): Promise<Project | undefined> {
    throw new Error("Method not implemented.");
  }
  deleteProject(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getTasksByProjectId(projectId: string): Promise<Task[]> {
    throw new Error("Method not implemented.");
  }
  updateTask(taskId: string, taskData: Partial<Task>): Promise<Task | undefined> {
    throw new Error("Method not implemented.");
  }
}

export const supabaseService = new SupabaseService();
