

'use client';
import { IDataService, Project, Task, User, ChatMessage, Comment } from "@/lib/types";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseAuthUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
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
  Timestamp
} from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

class FirebaseService implements IDataService {
  private auth;
  private firestore;

  constructor() {
    const { auth, firestore } = initializeFirebase();
    this.auth = auth;
    this.firestore = firestore;
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
        // Note: Using the user's UID as the document ID in the 'users' collection.
        const userRef = doc(this.firestore, "users", user.uid);
        await setDoc(userRef, {
          name: displayName,
          email: user.email!,
          avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
          role: 'Admin', // Default role for new sign-ups.
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
      };
    }
    return undefined;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'ownerId' | 'memberIds'> & { memberIds?: string[] }): Promise<Project> {
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
  
    return {
      id: docRef.id,
      name: newProjectData.name,
      description: newProjectData.description,
      ownerId: newProjectData.ownerId,
      memberIds: newProjectData.memberIds,
      createdAt: (newProjectData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      startDate: newProjectData.startDate,
      endDate: newProjectData.endDate,
    };
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
    await updateDoc(taskRef, taskData);
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
            tags: data.tags,
         } as Task;
    }
    return undefined;
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
}

export const firebaseService = new FirebaseService();

    