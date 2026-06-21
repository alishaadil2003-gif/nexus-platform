import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, UserRole, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      setUser(userData);
      return userData;
    }
    return null;
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      id: cred.user.uid,
      name,
      email,
      role,
      avatarUrl: '',
      bio: '',
      createdAt: new Date().toISOString(),
      ...(role === 'entrepreneur'
        ? { startupName: '', pitchSummary: '', fundingNeeded: '', industry: '', location: '', foundedYear: new Date().getFullYear(), teamSize: 1 }
        : { investmentInterests: [], investmentStage: [], portfolioCompanies: [], totalInvestments: 0, minimumInvestment: '', maximumInvestment: '' }),
    };
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resetPassword = async (oobCode: string, newPassword: string) => {
    await confirmPasswordReset(auth, oobCode, newPassword);
  };

  const updateProfile = async (userId: string, updates: Partial<User>) => {
    await updateDoc(doc(db, 'users', userId), updates as Record<string, unknown>);
    if (user && user.id === userId) {
      setUser({ ...user, ...updates });
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.id), updates as Record<string, unknown>);
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoading: loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      updateUser,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
