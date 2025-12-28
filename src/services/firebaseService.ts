'use client';
import { IDataService, Project, Task, User, ChatMessage, Comment, ProofingComment, WikiPage, TimeEntry, ActivityLog, Department, Employee, StickyNote, ProjectFramework } from "@/lib/types";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseAuthUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  Auth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  Timestamp,
  collectionGroup,
  limit,
  Firestore,
  writeBatch,
} from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

class FirebaseService implements IDataService {
  private _auth: Auth | null = null;
  private _firestore: Firestore | null = null;

  private get auth(): Auth {
    if (!this._auth) {
      this._initialize();
    }
    return this._auth!;
  }

  private get firestore(): Firestore {
    if (!this._firestore) {
      this._initialize();
    }
    return this._firestore!;
  }

  private _initialize() {
    const { auth, firestore } = initializeFirebase();
    this._auth = auth;
    this._firestore = firestore;
  }

  async login(email: string, password: string): Promise<FirebaseAuthUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async signUp(email: string, password: string, displayName: string): Promise<FirebaseAuthUser | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        await updateProfile(user, { displayName });
        const userRef = doc(this.firestore, "users", user.uid);
        // First user is always an Admin
        const usersCol = collection(this.firestore, 'users');
        const userDocs = await getDocs(usersCol);
        const role = userDocs.empty ? 'Admin' : 'Member';

        await setDoc(userRef, {
          id: user.uid,
          name: displayName,
          email: user.email!,
          avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
          role,
        });
      }
      
      return user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  async getUser(): Promise<FirebaseAuthUser | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        (error) => {
          unsubscribe();
          reject(error);
        }
      );
    });
  }

  onAuthStateChange(callback: (user: FirebaseAuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  async getUsers(): Promise<User[]> {
    const usersCol = collection(this.firestore, "users");
    const querySnapshot = await getDocs(usersCol);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatarUrl: data.avatarUrl,
      });
    });
    return users;
  }
  
  async getUserById(id: string): Promise<User | undefined> {
    const docRef = doc(this.firestore, 'users', id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      return docSnap.data() as User;
    }
    return undefined;
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, 'users', id);
    await updateDoc(userRef, data);

    if (data.name && this.auth.currentUser && this.auth.currentUser.uid === id) {
        await updateProfile(this.auth.currentUser, { displayName: data.name });
    }
  }

  async getDepartments(): Promise<Department[]> {
    const deptsCol = collection(this.firestore, 'departments');
    const q = query(deptsCol, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
  }

  async createDepartment(name: string): Promise<Department> {
    const deptCol = collection(this.firestore, 'departments');
    const docRef = await addDoc(deptCol, { name });
    return { id: docRef.id, name };
  }
  
  async deleteDepartment(id: string): Promise<void> {
    // Check if any employees are in this department
    const empQuery = query(collection(this.firestore, 'employees'), where('departmentId', '==', id), limit(1));
    const empSnap = await getDocs(empQuery);
    if(!empSnap.empty) {
        throw new Error("Cannot delete department with employees in it.");
    }
    await deleteDoc(doc(this.firestore, 'departments', id));
  }

  async getEmployees(): Promise<Employee[]> {
    const empCol = collection(this.firestore, 'employees');
    const snapshot = await getDocs(empCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const empCol = collection(this.firestore, 'employees');
    // Check if user is already an employee
    const q = query(empCol, where('userId', '==', employee.userId));
    const existing = await getDocs(q);
    if (!existing.empty) {
        // User is already an employee, update their record
        const existingDoc = existing.docs[0];
        await updateDoc(existingDoc.ref, employee);
        return { id: existingDoc.id, ...employee };
    }
    
    // Add new employee
    const docRef = await addDoc(empCol, employee);
    return { id: docRef.id, ...employee };
  }

  async deleteEmployee(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'employees', id));
  }

  async getProjects(): Promise<Project[]> {
    const user = this.auth.currentUser;
    if (!user) {
      return [];
    }

    const projectsCol = collection(this.firestore, "projects");
    const q = query(projectsCol, where("memberIds", "array-contains", user.uid));
    const querySnapshot = await getDocs(q);

    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        memberIds: data.memberIds,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        startDate: data.startDate,
        endDate: data.endDate,
        framework: data.framework,
      });
    });
    return projects;
  }
  
  async getProjectById(id: string): Promise<Project | undefined> {
    const docRef = doc(this.firestore, "projects", id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        memberIds: data.memberIds,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        startDate: data.startDate,
        endDate: data.endDate,
        framework: data.framework,
      };
    }
    return undefined;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'ownerId'> & { memberIds?: string[] }): Promise<Project> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error("User must be logged in to create a project.");
    }
  
    const memberIds = [...new Set([user.uid, ...(project.memberIds || [])])];
  
    const projectsCol = collection(this.firestore, "projects");
    const docRef = await addDoc(projectsCol, {
      ...project,
      ownerId: user.uid,
      memberIds: memberIds,
      createdAt: serverTimestamp(),
    });
  
    const newProjectSnapshot = await getDoc(docRef);
    const newProjectData = newProjectSnapshot.data();
  
    if (!newProjectData) {
      throw new Error("Failed to create project.");
    }

    const newProject: Project = {
        id: docRef.id,
        name: newProjectData.name,
        description: newProjectData.description,
        ownerId: newProjectData.ownerId,
        memberIds: newProjectData.memberIds,
        createdAt: (newProjectData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        startDate: newProjectData.startDate,
        endDate: newProjectData.endDate,
        framework: newProjectData.framework,
    };

    const details = { projectName: newProject.name };
    await this.logActivity('create', 'project', newProject.id, details, newProject.id);
  
    return newProject;
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project | undefined> {
    const docRef = doc(this.firestore, "projects", id);
    await updateDoc(docRef, project);
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<void> {
    const docRef = doc(this.firestore, "projects", id);
    await deleteDoc(docRef);
  }

  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    const tasksCol = collection(this.firestore, `projects/${projectId}/tasks`);
    const querySnapshot = await getDocs(tasksCol);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
            id: doc.id,
            projectId: projectId,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assigneeId: data.assigneeId,
            dueDate: data.dueDate,
            createdAt: data.createdAt?.toDate().toISOString(),
            tags: data.tags,
            customFields: data.customFields,
        });
    });
    return tasks;
  }

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task | undefined> {
    if (!taskData.projectId) {
        console.error("projectId is required to update a task.");
        throw new Error("projectId is required to update a task.");
    }

    const taskRef = doc(this.firestore, `projects/${taskData.projectId}/tasks`, taskId);
    const oldTaskSnap = await getDoc(taskRef);
    const oldTaskData = oldTaskSnap.data();

    await updateDoc(taskRef, taskData);

    // Log activity if status changed
    if (oldTaskData && taskData.status && oldTaskData.status !== taskData.status) {
        const project = await this.getProjectById(taskData.projectId);
        await this.logActivity(
            'update', 
            'task', 
            taskId, 
            { 
                taskTitle: taskData.title || oldTaskData.title,
                oldStatus: oldTaskData.status,
                newStatus: taskData.status,
                projectName: project?.name,
            }, 
            taskData.projectId
        );
    }

    const updatedDoc = await getDoc(taskRef);
    if(updatedDoc.exists()) {
        const data = updatedDoc.data();
        return { 
            id: updatedDoc.id,
            projectId: data.projectId,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assigneeId: data.assigneeId,
            dueDate: data.dueDate,
            createdAt: data.createdAt?.toDate().toISOString(),
            tags: data.tags,
         } as Task;
    }
    return undefined;
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    const taskRef = doc(this.firestore, `projects/${projectId}/tasks`, taskId);
    await deleteDoc(taskRef);
  }

  onChatMessages(projectId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesCol = collection(this.firestore, `projects/${projectId}/chat_messages`);
    const q = query(messagesCol, orderBy("timestamp", "asc"));

    return onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          content: data.content,
          timestamp: data.timestamp?.toDate().toISOString(),
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
        });
      });
      callback(messages);
    });
  }

  async sendChatMessage(projectId: string, content: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const messagesCol = collection(this.firestore, `projects/${projectId}/chat_messages`);
    await addDoc(messagesCol, {
      senderId: user.uid,
      content: content,
      timestamp: serverTimestamp(),
      senderName: user.displayName,
      senderAvatar: user.photoURL
    });
  }
  
  onTaskComments(projectId: string, taskId: string, callback: (comments: Comment[]) => void): () => void {
      const commentsCol = collection(this.firestore, `projects/${projectId}/tasks/${taskId}/comments`);
      const q = query(commentsCol, orderBy("createdAt", "asc"));
      
      return onSnapshot(q, (querySnapshot) => {
          const comments: Comment[] = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              comments.push({
                  id: doc.id,
                  userId: data.userId,
                  content: data.content,
                  createdAt: data.createdAt?.toDate().toISOString(),
                  userName: data.userName,
                  userAvatar: data.userAvatar,
              });
          });
          callback(comments);
      });
  }
  
  async addTaskComment(projectId: string, taskId: string, content: string): Promise<void> {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const commentsCol = collection(this.firestore, `projects/${projectId}/tasks/${taskId}/comments`);
      await addDoc(commentsCol, {
          userId: user.uid,
          content: content,
          createdAt: serverTimestamp(),
          userName: user.displayName,
          userAvatar: user.photoURL,
      });
  }

  onProofingComments(documentId: string, callback: (comments: ProofingComment[]) => void): () => void {
    const commentsCol = collection(this.firestore, `proofing_comments`);
    const q = query(commentsCol, where("documentId", "==", documentId), orderBy("createdAt", "asc"));

    return onSnapshot(q, (querySnapshot) => {
        const comments: ProofingComment[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            comments.push({
                id: doc.id,
                userId: data.userId,
                documentId: data.documentId,
                x: data.x,
                y: data.y,
                content: data.content,
                createdAt: data.createdAt?.toDate().toISOString(),
                userName: data.userName,
                userAvatar: data.userAvatar,
            });
        });
        callback(comments);
    });
  }

  async addProofingComment(documentId: string, comment: Omit<ProofingComment, 'id' | 'createdAt' | 'userId' | 'userName' | 'userAvatar'>): Promise<void> {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const commentsCol = collection(this.firestore, 'proofing_comments');
      await addDoc(commentsCol, {
          ...comment,
          documentId,
          userId: user.uid,
          userName: user.displayName,
          userAvatar: user.photoURL,
          createdAt: serverTimestamp(),
      });
  }

  // Wiki/Notes
  onWikiPages(projectId: string, callback: (pages: WikiPage[]) => void): () => void {
    const pagesCol = collection(this.firestore, `projects/${projectId}/wiki_pages`);
    const q = query(pagesCol, orderBy("createdAt", "asc"));
    
    return onSnapshot(q, (querySnapshot) => {
        const pages: WikiPage[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            pages.push({
                id: doc.id,
                projectId: data.projectId,
                title: data.title,
                content: data.content,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
            });
        });
        callback(pages);
    });
  }

  async createWikiPage(projectId: string, title: string): Promise<WikiPage> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error("User must be logged in to create a wiki page.");
    }
  
    const pagesCol = collection(this.firestore, `projects/${projectId}/wiki_pages`);
    const docRef = await addDoc(pagesCol, {
      projectId,
      title,
      content: `<h1>${title}</h1>`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newPageSnapshot = await getDoc(docRef);
    const newPageData = newPageSnapshot.data();
  
    if (!newPageData) {
      throw new Error("Failed to create wiki page.");
    }

    return {
      id: docRef.id,
      projectId: newPageData.projectId,
      title: newPageData.title,
      content: newPageData.content,
      createdAt: (newPageData.createdAt as Timestamp)?.toDate().toISOString(),
      updatedAt: (newPageData.updatedAt as Timestamp)?.toDate().toISOString(),
    };
  }

  async updateWikiPage(projectId: string, pageId: string, data: Partial<WikiPage>): Promise<void> {
    const pageRef = doc(this.firestore, `projects/${projectId}/wiki_pages`, pageId);
    await updateDoc(pageRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
  }

  async deleteWikiPage(projectId: string, pageId: string): Promise<void> {
    const pageRef = doc(this.firestore, `projects/${projectId}/wiki_pages`, pageId);
    await deleteDoc(pageRef);
  }

  // Sticky Notes
  onStickyNote(userId: string, callback: (note: StickyNote | null) => void): () => void {
    const noteRef = doc(this.firestore, `users/${userId}/sticky_notes/main`);
    return onSnapshot(noteRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            callback({
                id: doc.id,
                userId: data.userId,
                content: data.content,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
            });
        } else {
            callback(null);
        }
    });
  }

  async saveStickyNote(userId: string, content: string): Promise<void> {
    const noteRef = doc(this.firestore, `users/${userId}/sticky_notes/main`);
    await setDoc(noteRef, {
        userId,
        content,
        updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // Time Tracking
  onTimeEntries(projectId: string, taskId: string, callback: (entries: TimeEntry[]) => void): () => void {
    const entriesCol = collection(this.firestore, `projects/${projectId}/tasks/${taskId}/time_entries`);
    const q = query(entriesCol, orderBy("startTime", "desc"));

    return onSnapshot(q, (querySnapshot) => {
      const entries: TimeEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          userId: data.userId,
          taskId: data.taskId,
          projectId: data.projectId,
          startTime: data.startTime,
          endTime: data.endTime,
          duration: data.duration,
          notes: data.notes,
          billable: data.billable,
        });
      });
      callback(entries);
    });
  }

  async addTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || user.uid !== entry.userId) throw new Error("User not authenticated or mismatched.");

    const entriesCol = collection(this.firestore, `projects/${entry.projectId}/tasks/${entry.taskId}/time_entries`);
    await addDoc(entriesCol, entry);
  }
  
  // Activity Log
  async logActivity(action: string, resourceType: string, resourceId: string, details: any, projectId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return; // Don't log if no user

    const activityCol = collection(this.firestore, 'activity_logs');
    await addDoc(activityCol, {
        timestamp: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName, // Denormalize for easy display
        userAvatar: user.photoURL,  // Denormalize for easy display
        projectId,
        action, // e.g., 'create', 'update'
        resourceType, // e.g., 'task', 'project'
        resourceId,
        details: details, // Store rich context
    });
  }
  
  onActivityLogs(projectIds: string[], callback: (logs: ActivityLog[]) => void): () => void {
      if (projectIds.length === 0) {
        callback([]);
        return () => {};
      }
      // Note: Firestore 'in' queries are limited to 30 items.
      // For a production app with many projects, you might need a different strategy.
      const q = query(
        collectionGroup(this.firestore, 'activity_logs'),
        where('projectId', 'in', projectIds.slice(0, 30)),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (querySnapshot) => {
          const logs: ActivityLog[] = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              logs.push({
                  id: doc.id,
                  timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                  userId: data.userId,
                  userName: data.userName,
                  userAvatar: data.userAvatar,
                  projectId: data.projectId,
                  action: data.action,
                  resourceType: data.resourceType,
                  resourceId: data.resourceId,
                  details: data.details,
              });
          });
          callback(logs);
      });
  }
}

export const firebaseService = new FirebaseService();
