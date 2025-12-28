

import { IDataService, Project, Task, User, ChatMessage, Comment, ProofingComment, WikiPage, TimeEntry } from "@/lib/types";
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
  onChatMessages(projectId: string, callback: (messages: ChatMessage[]) => void): () => void {
      throw new Error("Method not implemented.");
  }
  sendChatMessage(projectId: string, content: string): Promise<void> {
      throw new Error("Method not implemented.");
  }
  onTaskComments(projectId: string, taskId: string, callback: (comments: Comment[]) => void): () => void {
      throw new Error("Method not implemented.");
  }
  addTaskComment(projectId: string, taskId: string, content: string): Promise<void> {
      throw new Error("Method not implemented.");
  }
  onProofingComments(documentId: string, callback: (comments: ProofingComment[]) => void): () => void {
      throw new Error("Method not implemented.");
  }
  addProofingComment(documentId: string, comment: Omit<ProofingComment, "id" | "createdAt" | "userId" | "userName" | "userAvatar">): Promise<void> {
      throw new Error("Method not implemented.");
  }

  // Wiki
  onWikiPages(projectId: string, callback: (pages: WikiPage[]) => void): () => void {
      throw new Error("Method not implemented.");
  }
  createWikiPage(projectId: string, title: string): Promise<WikiPage> {
      throw new Error("Method not implemented.");
  }
  updateWikiPage(projectId: string, pageId: string, data: Partial<WikiPage>): Promise<void> {
      throw new Error("Method not implemented.");
  }
  deleteWikiPage(projectId: string, pageId: string): Promise<void> {
      throw new Error("Method not implemented.");
  }

  // Time Tracking
  onTimeEntries(projectId: string, taskId: string, callback: (entries: TimeEntry[]) => void): () => void {
      throw new Error("Method not implemented.");
  }
  addTimeEntry(entry: Omit<TimeEntry, "id">): Promise<void> {
      throw new Error("Method not implemented.");
  }
}

export const supabaseService = new SupabaseService();
