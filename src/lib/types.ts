import { User as FirebaseAuthUser } from 'firebase/auth';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Admin' | 'Member' | 'Guest';
};

export type Department = {
    id: string;
    name: string;
};

export type Employee = {
    id: string;
    userId: string;
    departmentId: string;
    title: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  startDate?: string;
  endDate?: string;
};

export type TaskStatus = 'To-Do' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  tags: string[];
  dependencies?: string[];
  customFields?: Record<string, any>;
  isMilestone?: boolean;
};

export type Comment = {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    userName: string;
    userAvatar?: string;
};

export type ChatMessage = {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    senderName: string;
    senderAvatar?: string;
};

export type ProofingComment = {
    id: string;
    userId: string;
    documentId: string;
    x: number;
    y: number;
    content: string;
    createdAt: string;
    userName: string;
    userAvatar?: string;
};

export type WikiPage = {
    id: string;
    projectId: string;
    title: string;
    content: string; // JSON string
    createdAt: string;
    updatedAt: string;
};

export type StickyNote = {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export type ActivityLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
};

export type TimeEntry = {
  id: string;
  userId: string;
  taskId: string;
  projectId: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  billable: boolean;
};


// Data Service Interface
export interface IDataService {
  // Auth
  login(email: string, password: string): Promise<FirebaseAuthUser | null>;
  logout(): Promise<void>;
  signUp(email: string, password: string, displayName: string): Promise<FirebaseAuthUser | null>
  getUser(): Promise<FirebaseAuthUser | null>;
  onAuthStateChange(callback: (user: FirebaseAuthUser | null) => void): () => void;
  
  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<void>;

  // Departments & Employees
  getDepartments(): Promise<Department[]>;
  createDepartment(name: string): Promise<Department>;
  deleteDepartment(id: string): Promise<void>;
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Data
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'ownerId'>): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  // Tasks
  getTasksByProjectId(projectId: string): Promise<Task[]>;
  updateTask(taskId: string, taskData: Partial<Task>): Promise<Task | undefined>;
  deleteTask(projectId: string, taskId: string): Promise<void>;

  // Chat & Comments
  onChatMessages(projectId: string, callback: (messages: ChatMessage[]) => void): () => void;
  sendChatMessage(projectId: string, content: string): Promise<void>;
  onTaskComments(projectId: string, taskId: string, callback: (comments: Comment[]) => void): () => void;
  addTaskComment(projectId: string, taskId: string, content: string): Promise<void>;

  // Proofing
  onProofingComments(documentId: string, callback: (comments: ProofingComment[]) => void): () => void;
  addProofingComment(documentId: string, comment: Omit<ProofingComment, 'id' | 'createdAt' | 'userId' | 'userName' | 'userAvatar'>): Promise<void>;

  // Wiki
  onWikiPages(projectId: string, callback: (pages: WikiPage[]) => void): () => void;
  createWikiPage(projectId: string, title: string): Promise<WikiPage>;
  updateWikiPage(projectId: string, pageId: string, data: Partial<WikiPage>): Promise<void>;
  deleteWikiPage(projectId: string, pageId: string): Promise<void>;
  
  // Sticky Notes
  onStickyNote(userId: string, callback: (note: StickyNote | null) => void): () => void;
  saveStickyNote(userId: string, content: string): Promise<void>;

  // Time Tracking
  onTimeEntries(projectId: string, taskId: string, callback: (entries: TimeEntry[]) => void): () => void;
  addTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<void>;

  // Activity Log
  logActivity(action: string, resourceType: string, resourceId: string, details: any, projectId: string): Promise<void>;
  onActivityLogs(projectIds: string[], callback: (logs: ActivityLog[]) => void): () => void;
}
