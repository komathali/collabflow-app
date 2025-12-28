
'use client';
import { IDataService, Project, User } from "@/lib/types";
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
        const newUser: Omit<User, 'id'> = {
          name: displayName,
          email: user.email!,
          avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
          role: 'Admin', // Default role for new sign-ups.
        };
        // Use setDoc to explicitly set the document with the user's UID.
        await setDoc(userRef, newUser);
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
    const user = await this.getUser();
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

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'ownerId' | 'memberIds'>): Promise<Project> {
    const user = await this.getUser();
    if (!user) {
      throw new Error("User must be logged in to create a project.");
    }

    const projectsCol = collection(this.firestore, "projects");
    const docRef = await addDoc(projectsCol, {
      ...project,
      ownerId: user.uid,
      memberIds: [user.uid, ...(project.memberIds || [])], // Ensure owner is a member
      createdAt: serverTimestamp(),
    });

    const newProject = await this.getProjectById(docRef.id);
    if(!newProject) {
      throw new Error("Failed to create project.");
    }
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
}

export const firebaseService = new FirebaseService();
