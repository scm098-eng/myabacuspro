
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseAuthProfile,
  type User,
} from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore, type Firestore, collection, getDocs, query, where, arrayUnion, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage, type FirebaseStorage, deleteObject } from 'firebase/storage';
import type { ProfileData, TestResult, SignupData, UserRole, UpdateProfilePayload } from '@/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  login: (email: string, pass: string) => Promise<ProfileData | null>;
  signup: (values: SignupData) => Promise<void>;
  loginWithGoogle: () => Promise<ProfileData | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (uid: string, data: UpdateProfilePayload) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  upgradeToPro: () => Promise<void>;
  getAllUsers: (role?: UserRole) => Promise<ProfileData[]>;
  getApprovedTeachers: () => Promise<ProfileData[]>;
  getUserTestHistory: (userId: string) => Promise<TestResult[]>;
  getUserProfile: (userId: string) => Promise<ProfileData | null>;
  approveTeacher: (teacherId: string, callback?: () => void) => Promise<void>;
  getCompletedGameLevels: () => Promise<number[]>;
  saveCompletedGameLevel: (levelId: number) => Promise<void>;
  fetchProfile: (user: User) => Promise<ProfileData | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
const ADMIN_EMAILS = ['scm098@gmail.com', 'pallavib202@gmail.com', 'myabacuspro@gmail.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const fetchProfile = useCallback(async (user: User): Promise<ProfileData | null> => {
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const profileData = { ...userDoc.data(), uid: user.uid } as ProfileData;
        const isAdminByEmail = ADMIN_EMAILS.includes(user.email || '');
        
        if (isAdminByEmail) {
            profileData.role = 'admin';
        }

        if (profileData.role === 'admin') {
          profileData.subscriptionStatus = 'pro';
        }
        
        setProfile(profileData);
        
        if (profileData.role === 'student' && !profileData.teacherId && pathname !== '/profile' && pathname !== '/signup' && pathname !== '/login') {
            toast({
                title: 'Please Select a Teacher',
                description: 'You must select a teacher before you can access other parts of the site.',
                variant: 'destructive',
            });
            router.push('/profile');
        }

        return profileData;
      }
      return null;
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `/users/${user.uid}`,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error('Error fetching profile:', error);
        }
        return null;
    }
  }, [firestore, pathname, router, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth, fetchProfile]);

  const login = useCallback(async (email: string, pass: string): Promise<ProfileData | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return await fetchProfile(userCredential.user);
  }, [auth, fetchProfile]);
  
  const signup = useCallback(async (values: SignupData) => {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      let photoURL = '';
      if (values.profilePhoto) {
        const file = values.profilePhoto;
        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateFirebaseAuthProfile(user, {
          displayName: `${values.firstName} ${values.surname}`,
          photoURL: photoURL
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      const { password, confirmPassword, profilePhoto, ...rest } = values;
      
      const isAdmin = ADMIN_EMAILS.includes(user.email || '');
      const role = isAdmin ? 'admin' : values.role;

      const dataToSave: Omit<ProfileData, 'uid'> & { createdAt: any } = {
          ...rest,
          email: user.email!,
          profilePhoto: photoURL || '',
          createdAt: serverTimestamp(),
          subscriptionStatus: 'free',
          role: role,
          teacherId: values.teacherId || null, 
          ...(role === 'teacher' && { 
            status: 'pending',
            instituteAddress: [values.instituteAddressLine1, values.instituteCity, values.instituteTaluka, values.instituteDistrict, values.instituteState, values.institutePincode].filter(Boolean).join(', ')
          }),
      };

      await setDoc(userDocRef, dataToSave).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      await login(values.email, values.password);

  }, [auth, firestore, storage, login]);

  const loginWithGoogle = useCallback(async (): Promise<ProfileData | null> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const [firstName, ...rest] = (user.displayName || '').split(' ');
      const surname = rest.pop() || '';
      const middleName = rest.join(' ');
      const isAdmin = ADMIN_EMAILS.includes(user.email || '');
      
       const dataToSave = {
        uid: user.uid,
        email: user.email,
        firstName: firstName || '',
        surname: surname,
        middleName: middleName,
        profilePhoto: user.photoURL || '',
        createdAt: serverTimestamp(),
        subscriptionStatus: 'free',
        role: isAdmin ? 'admin' : 'student',
        teacherId: null,
      };

       await setDoc(userDocRef, dataToSave).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
       });
    }
    return await fetchProfile(user);
  }, [auth, firestore, fetchProfile]);
  
  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, [auth]);

  const updateUserProfile = useCallback(async (uid: string, data: UpdateProfilePayload) => {
    const { profilePhoto, ...profileData } = data;
    const userDocRef = doc(firestore, 'users', uid);

    const payload: Partial<Omit<ProfileData, 'uid' | 'email' | 'createdAt'>> & { updatedAt: any } = {
        ...profileData,
        updatedAt: serverTimestamp(),
    };

    if (profilePhoto) {
        const storageRef = ref(storage, `profile_photos/${uid}`);
        await uploadBytes(storageRef, profilePhoto);
        payload.profilePhoto = await getDownloadURL(storageRef);
    }
    
    await updateDoc(userDocRef, payload).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw to be caught by the calling function
    });
}, [firestore, storage]);


  const upgradeToPro = useCallback(async () => {
    if (!user) throw new Error("User not logged in");
    const userDocRef = doc(firestore, 'users', user.uid);
    await updateDoc(userDocRef, { subscriptionStatus: 'pro' });
    await fetchProfile(user);
  }, [user, firestore, fetchProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);
  
  const getAllUsers = useCallback(async (role?: UserRole): Promise<ProfileData[]> => {
    const usersCol = collection(firestore, 'users');
    let q;
    if (role) {
        q = query(usersCol, where("role", "==", role));
    } else {
        q = query(usersCol);
    }

    try {
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as ProfileData));
        return userList;
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: '/users',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        console.error("Failed to fetch users:", error);
        return [];
    }
  }, [firestore]);

  const getApprovedTeachers = useCallback(async (): Promise<ProfileData[]> => {
    const usersCol = collection(firestore, 'users');
    const q = query(usersCol, where("role", "==", "teacher"), where("status", "==", "approved"));
     try {
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as ProfileData));
        return userList;
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: '/users',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        console.error("Failed to fetch users:", error);
        return [];
    }
  }, [firestore]);


  const getUserTestHistory = useCallback(async (userId: string): Promise<TestResult[]> => {
     if (profile?.role === 'admin' || profile?.role === 'teacher') {
        const testResultsCollection = collection(firestore, 'testResults');
        const q = query(testResultsCollection, where("userId", "==", userId));
        try {
            const querySnapshot = await getDocs(q); 
            const history: TestResult[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                history.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt.toDate(),
                } as TestResult);
            });
            return history;
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: '/testResults',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            return [];
        }
     }
     return [];
  }, [profile, firestore]);

  const getUserProfile = useCallback(async (userId: string): Promise<ProfileData | null> => {
     if (profile?.role === 'admin' || profile?.role === 'teacher') {
        const userDocRef = doc(firestore, 'users', userId);
        try {
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? userDoc.data() as ProfileData : null;
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: `/users/${userId}`,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            return null;
        }
     }
     return null;
  }, [profile, firestore]);
  
  const approveTeacher = useCallback(async (teacherId: string, callback?: () => void) => {
    if (profile?.role !== 'admin') {
        throw new Error('Only admins can approve teachers.');
    }
    
    const teacherRef = doc(firestore, 'users', teacherId);
    const dataToUpdate = { 
        status: 'approved',
        updatedAt: serverTimestamp(),
    };
    
    updateDoc(teacherRef, dataToUpdate)
        .then(() => {
            if(callback) callback();
        })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: teacherRef.path,
                operation: 'update',
                requestResourceData: dataToUpdate,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }, [profile?.role, firestore]);


  const getCompletedGameLevels = useCallback(async (): Promise<number[]> => {
    if (!user) return [];
    const docRef = doc(firestore, "gameProgress", user.uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().completedLevels || [];
        }
        return [];
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `/gameProgress/${user.uid}`,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        return [];
    }
  }, [user, firestore]);

  const saveCompletedGameLevel = useCallback(async (levelId: number) => {
    if (!user) return;
    const docRef = doc(firestore, "gameProgress", user.uid);
    await setDoc(docRef, {
      completedLevels: arrayUnion(levelId)
    }, { merge: true }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { completedLevels: arrayUnion(levelId) },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, firestore]);

  const value = { user, profile, login, signup, loginWithGoogle, logout, isLoading, upgradeToPro, sendPasswordReset, updateUserProfile, getAllUsers, getApprovedTeachers, getUserTestHistory, getUserProfile, approveTeacher, getCompletedGameLevels, saveCompletedGameLevel, fetchProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
