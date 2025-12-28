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
        const userRef = doc(this.firestore, "users", user.uid);
        const newUser: Omit<User, 'id'> = {
          name: displayName,
          email: user.email!,
          avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
          role: 'Admin', // Default role
        };
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
      });
    });
    return projects;
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
      memberIds: [user.uid],
      createdAt: serverTimestamp(),
    });

    return {
      ...project,
      id: docRef.id,
      ownerId: user.uid,
      memberIds: [user.uid],
      createdAt: new Date().toISOString(),
    };
  }
}

export const firebaseService = new FirebaseService();
