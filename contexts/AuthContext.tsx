import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { generateMockData } from '../utils/analytics';

export interface UserData {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'trial';
  createdAt: string;
  trialEndDate?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  startTrial: () => Promise<void>;
  upgradeSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUser(userDoc.data() as UserData);
          } else {
            const fallbackUser: UserData = {
              id: firebaseUser.uid,
              name: firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              plan: 'free',
              createdAt: new Date().toISOString()
            };
            setUser(fallbackUser);
          }
        } catch (e: any) {
          console.warn("Auth profile fetch restricted. Using minimal local profile.", e.message);
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            plan: 'free',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUser(null);
        const hasVisited = localStorage.getItem('timetools_visited');
        if (!hasVisited) {
            generateMockData();
            localStorage.setItem('timetools_visited', 'true');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password = 'password123') => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password = 'password123') => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (!result.user) throw new Error("Signup failed");

      const newUser: UserData = {
          id: result.user.uid,
          name: email.split('@')[0],
          email: email,
          plan: 'free',
          createdAt: new Date().toISOString()
      };
      
      try {
        await setDoc(doc(db, 'users', result.user.uid), newUser);
      } catch (e) {
        console.warn("Failed to create Firestore profile. Auth succeeded, but DB restricted.", e);
      }
      setUser(newUser);
  }

  const logout = () => signOut(auth);

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const startTrial = async () => {
    if (!user) return;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    const endDateStr = endDate.toISOString();
    
    const updatedUser: UserData = { ...user, plan: 'trial', trialEndDate: endDateStr };
    
    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        plan: 'trial',
        trialEndDate: endDateStr
      });
      setUser(updatedUser);
    } catch (e) {
      console.error("Failed to start trial in DB", e);
      setUser(updatedUser); 
    }
  };

  const upgradeSubscription = async () => {
    if (!user) return;
    const updatedUser: UserData = { ...user, plan: 'pro', trialEndDate: undefined };
    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        plan: 'pro',
        trialEndDate: null 
      });
      setUser(updatedUser);
    } catch (e) {
      console.error("Failed to upgrade in DB", e);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, startTrial, upgradeSubscription }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};