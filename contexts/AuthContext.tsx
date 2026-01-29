
import React, { createContext, useContext, useState, useEffect } from 'react';
// Fix: Use firebase/compat/app for type definitions if needed, or rely on the exported auth/db
import firebase from 'firebase/compat/app';
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
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  startTrial: () => Promise<void>;
  upgradeSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix: Use compat method call for onAuthStateChanged
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await db.collection('users').doc(firebaseUser.uid).get();

          if (userDoc.exists) {
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

    return unsubscribe;
  }, []);

  // Fix: Use compat methods for login, signup, logout, and resetPassword
  const login = async (email: string, password = 'password123') => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const signup = async (email: string, password = 'password123') => {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      if (!result.user) throw new Error("Signup failed");

      const newUser: UserData = {
          id: result.user.uid,
          name: email.split('@')[0],
          email: email,
          plan: 'free',
          createdAt: new Date().toISOString()
      };
      
      try {
        await db.collection('users').doc(result.user.uid).set(newUser);
      } catch (e) {
        console.warn("Failed to create Firestore profile. Auth succeeded, but DB restricted.", e);
      }
      setUser(newUser);
  }

  const logout = () => auth.signOut();

  const resetPassword = async (email: string) => {
    await auth.sendPasswordResetEmail(email);
  };

  const startTrial = async () => {
    if (!user) return;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    const endDateStr = endDate.toISOString();
    
    const updatedUser: UserData = { ...user, plan: 'trial', trialEndDate: endDateStr };
    
    try {
      await db.collection('users').doc(user.id).update({
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
      await db.collection('users').doc(user.id).update({
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
