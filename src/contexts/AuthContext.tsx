'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseAuthProfile,
  type User,
} from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore, type Firestore, collection, getDocs, query, where, arrayUnion, updateDoc, increment, orderBy, limit, onSnapshot, deleteDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage, type FirebaseStorage, deleteObject } from 'firebase/storage';
import type { ProfileData, TestResult, SignupData, UserRole, UpdateProfilePayload } from '@/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import { RANK_CRITERIA } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  login: (email: string, pass: string) => Promise<ProfileData | null>;
  signup: (values: SignupData) => Promise<void>;
  loginWithGoogle: () => Promise<ProfileData | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (uid: string, data: UpdateProfilePayload) => Promise<void>;
  toggleUserSuspension: (uid: string, isSuspended: boolean) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  upgradeToPro: () => Promise<void>;
  getAllUsers: (role?: UserRole) => Promise<ProfileData[]>;
  getApprovedTeachers: () => Promise<ProfileData[]>;
  getUserTestHistory: (userId: string) => Promise<TestResult[]>;
  getUserTestHistoryByDateRange: (userId: string, start: Date, end: Date) => Promise<TestResult[]>;
  getUserProfile: (userId: string) => Promise<ProfileData | null>;
  approveTeacher: (teacherId: string, callback?: () => void) => Promise<void>;
  getCompletedGameLevels: () => Promise<number[]>;
  saveCompletedGameLevel: (levelId: number) => Promise<void>;
  fetchProfile: (user: User) => Promise<ProfileData | null>;
  recordDailyPractice: (userId: string) => Promise<void>;
  addPoints: (userId: string, points: number) => Promise<void>;
  getStudentTitle: (totalDays: number, totalPoints: number) => typeof RANK_CRITERIA[0];
  migrateStudents: (fromEmail: string, toEmail: string) => Promise<{ success: boolean; count: number }>;
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const ADMIN_EMAILS = ['pallavib202@gmail.com', 'myabacuspro@gmail.com', 'pallavib202@gmail.com'];
const EXCLUDED_FROM_TEACHER_LIST = ['scm098@gmail.com', 'satishmane@gmail.com'];

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
      const userDoc = await getDoc(userDocRef).catch(async (error) => {
          if (error.code === 'permission-denied') {
              const permissionError = new FirestorePermissionError({
                  path: `/users/${user.uid}`,
                  operation: 'get',
              });
              errorEmitter.emit('permission-error', permissionError);
          }
          throw error;
      });

      if (userDoc.exists()) {
        const data = userDoc.data();
        const profileData = { ...data, uid: user.uid } as ProfileData;
        
        const userEmail = user.email?.toLowerCase() || '';
        const isAdminByEmail = ADMIN_EMAILS.includes(userEmail);
        
        if (isAdminByEmail) {
            profileData.role = 'admin';
            profileData.subscriptionStatus = 'pro';
            if (profileData.status === 'pending') profileData.status = 'approved';
        }

        if (profileData.role === 'student' && profileData.subscriptionStatus === 'free' && !profileData.trialStartDate) {
            const now = new Date();
            await updateDoc(userDocRef, {
                trialStartDate: serverTimestamp()
            });
            profileData.trialStartDate = { toDate: () => now };
        }

        setProfile(profileData);

        if (profileData.isSuspended && pathname !== '/suspended') {
          router.push('/suspended');
          return profileData;
        }
        
        if (profileData.role === 'student' && !profileData.teacherId && !['/profile', '/signup', '/login', '/about', '/pricing', '/contact', '/'].includes(pathname)) {
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
        console.error('Error fetching profile:', error);
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

  const isTrialActive = useMemo(() => {
    if (!profile || profile.role !== 'student' || profile.subscriptionStatus === 'pro') return false;
    const startDate = profile.trialStartDate?.toDate ? profile.trialStartDate.toDate() : (profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt));
    if (!startDate || isNaN(startDate.getTime())) return false;
    const now = new Date();
    const diffInMs = now.getTime() - startDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= 3;
  }, [profile]);

  const trialDaysRemaining = useMemo(() => {
    if (!profile || profile.role !== 'student' || profile.subscriptionStatus === 'pro') return 0;
    const startDate = profile.trialStartDate?.toDate ? profile.trialStartDate.toDate() : (profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt));
    if (!startDate || isNaN(startDate.getTime())) return 0;
    const now = new Date();
    const expiryDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffInMs = expiryDate.getTime() - now.getTime();
    return Math.max(0, diffInMs / (1000 * 60 * 60 * 24));
  }, [profile]);

  const login = useCallback(async (email: string, pass: string): Promise<ProfileData | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return await fetchProfile(userCredential.user);
  }, [auth, fetchProfile]);
  
  const signup = useCallback(async (values: SignupData) => {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      await sendEmailVerification(user);

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
      const { password, confirmPassword, ...rest } = values;
      const userEmail = user.email?.toLowerCase() || '';
      const isAdmin = ADMIN_EMAILS.includes(userEmail);
      const role = isAdmin ? 'admin' : values.role;
      const subStatus = isAdmin ? 'pro' : 'free';

      const dataToSave: Omit<ProfileData, 'uid'> & { createdAt: any } = {
          ...rest,
          email: user.email!,
          profilePhoto: photoURL || '',
          createdAt: serverTimestamp(),
          trialStartDate: serverTimestamp(),
          subscriptionStatus: subStatus as any,
          role: role,
          teacherId: values.teacherId || null, 
          isSuspended: false,
          ...(role === 'teacher' && { 
            status: 'pending',
            instituteAddress: [values.instituteAddressLine1, values.instituteCity, values.instituteTaluka, values.instituteDistrict, values.instituteState, values.institutePincode].filter(Boolean).join(', ')
          }),
          ...(role === 'admin' && { status: 'approved' }),
          currentStreak: 0,
          totalDaysPracticed: 0,
          monthlyPoints: 0,
          weeklyPoints: 0,
          totalPoints: 0,
          lastAwardedRank: 'Junior Calculator',
          lastWeeklyReset: format(startOfWeek(new Date()), 'yyyy-ww'),
          lastMonthlyReset: format(startOfMonth(new Date()), 'yyyy-MM')
      };

      await setDoc(userDocRef, dataToSave);
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
      const userEmail = user.email?.toLowerCase() || '';
      const isAdmin = ADMIN_EMAILS.includes(userEmail);
      
       const dataToSave = {
        uid: user.uid,
        email: user.email,
        firstName: firstName || '',
        surname: surname,
        middleName: middleName,
        profilePhoto: user.photoURL || '',
        createdAt: serverTimestamp(),
        trialStartDate: serverTimestamp(),
        subscriptionStatus: isAdmin ? 'pro' : 'free',
        role: isAdmin ? 'admin' : 'student',
        teacherId: null,
        isSuspended: false,
        status: isAdmin ? 'approved' : undefined,
        currentStreak: 0,
        totalDaysPracticed: 0,
        monthlyPoints: 0,
        weeklyPoints: 0,
        totalPoints: 0,
        lastAwardedRank: 'Junior Calculator',
        lastWeeklyReset: format(startOfWeek(new Date()), 'yyyy-ww'),
        lastMonthlyReset: format(startOfMonth(new Date()), 'yyyy-MM')
      };
       await setDoc(userDocRef, dataToSave);
    }
    return await fetchProfile(user);
  }, [auth, firestore, fetchProfile]);
  
  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, [auth]);

  const sendVerificationEmail = useCallback(async () => {
    if (user) await sendEmailVerification(user);
  }, [user]);

  const updateUserProfile = useCallback(async (uid: string, data: UpdateProfilePayload) => {
    const { profilePhoto, ...profileData } = data;
    const userDocRef = doc(firestore, 'users', uid);
    const payload: any = { ...profileData, updatedAt: serverTimestamp() };
    if (profilePhoto) {
        const storageRef = ref(storage, `profile_photos/${uid}`);
        await uploadBytes(storageRef, profilePhoto);
        payload.profilePhoto = await getDownloadURL(storageRef);
    }
    await updateDoc(userDocRef, payload);
  }, [firestore, storage]);

  const toggleUserSuspension = useCallback(async (uid: string, isSuspended: boolean) => {
    if (profile?.role !== 'admin') throw new Error("Unauthorized");
    await updateDoc(doc(firestore, 'users', uid), { isSuspended, updatedAt: serverTimestamp() });
  }, [profile, firestore]);

  const deleteUserAccount = useCallback(async (uid: string) => {
    if (profile?.role !== 'admin') throw new Error("Unauthorized");
    await deleteDoc(doc(firestore, 'users', uid));
  }, [profile, firestore]);

  const upgradeToPro = useCallback(async () => {
    if (!user) throw new Error("User not logged in");
    await updateDoc(doc(firestore, 'users', user.uid), { subscriptionStatus: 'pro' });
    await fetchProfile(user);
  }, [user, firestore, fetchProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);
  
  const getAllUsers = useCallback(async (role?: UserRole): Promise<ProfileData[]> => {
    const usersCol = collection(firestore, 'users');
    const q = role ? query(usersCol, where("role", "==", role)) : query(usersCol);
    try {
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as ProfileData));
    } catch (e) { return []; }
  }, [firestore]);

  const getApprovedTeachers = useCallback(async (): Promise<ProfileData[]> => {
    const usersCol = collection(firestore, 'users');
    const q = query(usersCol, where("role", "in", ["teacher", "admin"]));
     try {
        const snap = await getDocs(q);
        return snap.docs
            .map(doc => ({ ...doc.data(), uid: doc.id } as ProfileData))
            .filter(u => !EXCLUDED_FROM_TEACHER_LIST.includes(u.email?.toLowerCase()))
            .filter(u => u.role === 'admin' || u.status === 'approved');
    } catch (e) { return []; }
  }, [firestore]);

  const getUserTestHistory = useCallback(async (userId: string): Promise<TestResult[]> => {
     if (profile?.role === 'admin' || profile?.role === 'teacher') {
        const q = query(collection(firestore, 'testResults'), where("userId", "==", userId));
        try {
            const snap = await getDocs(q); 
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
        } catch (e) { return []; }
     }
     return [];
  }, [profile, firestore]);

  const getUserTestHistoryByDateRange = useCallback(async (userId: string, start: Date, end: Date): Promise<TestResult[]> => {
    const q = query(collection(firestore, 'testResults'), where("userId", "==", userId), where("createdAt", ">=", start), where("createdAt", "<=", end));
    try {
        const snap = await getDocs(q); 
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
    } catch (e) { return []; }
  }, [firestore]);

  const getUserProfile = useCallback(async (userId: string): Promise<ProfileData | null> => {
     if (profile?.role === 'admin' || profile?.role === 'teacher') {
        try {
            const snap = await getDoc(doc(firestore, 'users', userId));
            return snap.exists() ? snap.data() as ProfileData : null;
        } catch (e) { return null; }
     }
     return null;
  }, [profile, firestore]);
  
  const approveTeacher = useCallback(async (teacherId: string, callback?: () => void) => {
    if (profile?.role !== 'admin') throw new Error('Unauthorized');
    await updateDoc(doc(firestore, 'users', teacherId), { status: 'approved', updatedAt: serverTimestamp() });
    if(callback) callback();
  }, [profile?.role, firestore]);

  const getCompletedGameLevels = useCallback(async (): Promise<number[]> => {
    if (!user) return [];
    try {
        const snap = await getDoc(doc(firestore, "gameProgress", user.uid));
        return snap.exists() ? snap.data().completedLevels || [] : [];
    } catch (e) { return []; }
  }, [user, firestore]);

  const saveCompletedGameLevel = useCallback(async (levelId: number) => {
    if (!user) return;
    await setDoc(doc(firestore, "gameProgress", user.uid), { completedLevels: arrayUnion(levelId) }, { merge: true });
  }, [user, firestore]);

  const addPoints = useCallback(async (userId: string, points: number) => {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data = userSnap.data() as ProfileData;
    const now = new Date();
    const currentWeekKey = format(startOfWeek(now), 'yyyy-ww');
    const currentMonthKey = format(startOfMonth(now), 'yyyy-MM');
    const updateData: any = { totalPoints: increment(points), updatedAt: serverTimestamp() };
    if (data.lastWeeklyReset !== currentWeekKey) { updateData.weeklyPoints = points; updateData.lastWeeklyReset = currentWeekKey; } else { updateData.weeklyPoints = increment(points); }
    if (data.lastMonthlyReset !== currentMonthKey) { updateData.monthlyPoints = points; updateData.lastMonthlyReset = currentMonthKey; } else { updateData.monthlyPoints = increment(points); }
    await updateDoc(userRef, updateData);
    await fetchProfile({ uid: userId } as User);
  }, [firestore, fetchProfile]);

  const recordDailyPractice = useCallback(async (userId: string) => {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data = userSnap.data() as ProfileData;
    const today = new Date().toISOString().split('T')[0];
    const lastDate = data.lastPracticeDate || "";
    if (lastDate === today) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    let newStreak = lastDate === yesterdayStr ? (data.currentStreak || 0) + 1 : 1;
    await updateDoc(userRef, { lastPracticeDate: today, currentStreak: newStreak, totalDaysPracticed: increment(1), updatedAt: serverTimestamp() });
    await addPoints(userId, 25);
  }, [firestore, addPoints]);

  const getStudentTitle = useCallback((totalDays: number, totalPoints: number) => {
    return RANK_CRITERIA.find(t => totalDays >= t.daysReq && totalPoints >= t.pointsReq) || RANK_CRITERIA[RANK_CRITERIA.length - 1];
  }, []);

  const migrateStudents = useCallback(async (fromEmail: string, toEmail: string) => {
    if (profile?.role !== 'admin') throw new Error('Admin only');
    
    // 1. Get UIDs for both emails
    const usersCol = collection(firestore, 'users');
    const qFrom = query(usersCol, where('email', '==', fromEmail.toLowerCase().trim()), limit(1));
    const qTo = query(usersCol, where('email', '==', toEmail.toLowerCase().trim()), limit(1));
    
    const [snapFrom, snapTo] = await Promise.all([getDocs(qFrom), getDocs(qTo)]);
    
    if (snapFrom.empty) throw new Error(`Source teacher (${fromEmail}) not found.`);
    if (snapTo.empty) throw new Error(`Target teacher (${toEmail}) not found.`);
    
    const fromUid = snapFrom.docs[0].id;
    const toUid = snapTo.docs[0].id;
    
    // 2. Find all students assigned to fromUid
    const qStudents = query(usersCol, where('teacherId', '==', fromUid));
    const snapStudents = await getDocs(qStudents);
    
    if (snapStudents.empty) return { success: true, count: 0 };
    
    // 3. Batch update
    const batch = writeBatch(firestore);
    snapStudents.docs.forEach(doc => {
      batch.update(doc.ref, { teacherId: toUid, updatedAt: serverTimestamp() });
    });
    
    await batch.commit();
    return { success: true, count: snapStudents.size };
  }, [firestore, profile]);

  const value = { 
    user, profile, login, signup, loginWithGoogle, logout, isLoading, upgradeToPro, 
    sendPasswordReset, sendVerificationEmail, updateUserProfile, toggleUserSuspension, deleteUserAccount, getAllUsers, getApprovedTeachers, 
    getUserTestHistory, getUserTestHistoryByDateRange, getUserProfile, approveTeacher, getCompletedGameLevels, 
    saveCompletedGameLevel, fetchProfile, recordDailyPractice, addPoints, getStudentTitle, isTrialActive, trialDaysRemaining, migrateStudents
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};