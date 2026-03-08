'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
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
import { doc, setDoc, getDoc, serverTimestamp, getFirestore, collection, getDocs, query, where, arrayUnion, updateDoc, increment, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { ProfileData, TestResult, SignupData, UserRole, UpdateProfilePayload } from '@/types';
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
  sendOTP: () => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
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
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const ADMIN_EMAILS = ['pallavib202@gmail.com', 'myabacuspro@gmail.com'];
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
  
  const fetchProfile = useCallback(async (authUser: User): Promise<ProfileData | null> => {
    try {
      const userDocRef = doc(firestore, 'users', authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const profileData = { ...data, uid: authUser.uid } as ProfileData;
        
        if (data.emailVerified !== authUser.emailVerified) {
          await updateDoc(userDocRef, { emailVerified: authUser.emailVerified });
          profileData.emailVerified = authUser.emailVerified;
        }

        const userEmail = authUser.email?.toLowerCase() || '';
        if (ADMIN_EMAILS.includes(userEmail)) {
            profileData.role = 'admin';
            profileData.subscriptionStatus = 'pro';
            if (profileData.status !== 'approved' || !profileData.emailVerified) {
              await updateDoc(userDocRef, { status: 'approved', role: 'admin', subscriptionStatus: 'pro', emailVerified: true });
            }
        }

        setProfile(profileData);

        if (profileData.isSuspended && pathname !== '/suspended') {
          router.push('/suspended');
        }
        
        return profileData;
      }
      return null;
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return null;
    }
  }, [firestore, pathname, router]);

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
    const startDate = profile.trialStartDate?.toDate ? profile.trialStartDate.toDate() : (profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date());
    const now = new Date();
    const diffInDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 3;
  }, [profile]);

  const trialDaysRemaining = useMemo(() => {
    if (!profile || profile.role !== 'student' || profile.subscriptionStatus === 'pro') return 0;
    const startDate = profile.trialStartDate?.toDate ? profile.trialStartDate.toDate() : (profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date());
    const expiryDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffInMs = expiryDate.getTime() - new Date().getTime();
    return Math.max(0, diffInMs / (1000 * 60 * 60 * 24));
  }, [profile]);

  const login = useCallback(async (email: string, pass: string): Promise<ProfileData | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return await fetchProfile(userCredential.user);
  }, [auth, fetchProfile]);
  
  const signup = useCallback(async (values: SignupData) => {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      let photoURL = '';
      if (values.profilePhoto) {
        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        await uploadBytes(storageRef, values.profilePhoto);
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
      
      const dataToSave: Omit<ProfileData, 'uid'> = {
          ...rest,
          email: user.email!,
          emailVerified: isAdmin,
          profilePhoto: photoURL || '',
          createdAt: serverTimestamp(),
          trialStartDate: serverTimestamp(),
          subscriptionStatus: isAdmin ? 'pro' : 'free',
          role: isAdmin ? 'admin' : values.role,
          teacherId: values.teacherId || null, 
          isSuspended: false,
          status: isAdmin ? 'approved' : (values.role === 'teacher' ? 'pending' : undefined),
          currentStreak: 0,
          totalDaysPracticed: 0,
          monthlyPoints: 0,
          weeklyPoints: 0,
          totalPoints: 0,
          lastWeeklyReset: format(startOfWeek(new Date()), 'yyyy-ww'),
          lastMonthlyReset: format(startOfMonth(new Date()), 'yyyy-MM')
      };

      await setDoc(userDocRef, dataToSave);
      await fetchProfile(user);
  }, [auth, firestore, storage, fetchProfile]);

  const loginWithGoogle = useCallback(async (): Promise<ProfileData | null> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const [firstName, ...rest] = (user.displayName || '').split(' ');
      const surname = rest.pop() || '';
      const userEmail = user.email?.toLowerCase() || '';
      const isAdmin = ADMIN_EMAILS.includes(userEmail);
      
       await setDoc(userDocRef, {
        email: user.email,
        emailVerified: user.emailVerified || isAdmin,
        firstName: firstName || '',
        surname: surname,
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
        lastWeeklyReset: format(startOfWeek(new Date()), 'yyyy-ww'),
        lastMonthlyReset: format(startOfMonth(new Date()), 'yyyy-MM')
      });
    }
    return await fetchProfile(user);
  }, [auth, firestore, fetchProfile]);
  
  const sendOTP = useCallback(async () => {
    const functions = getFunctions(firebaseApp);
    const sendFn = httpsCallable(functions, 'sendVerificationOTP');
    await sendFn();
  }, []);

  const verifyOTP = useCallback(async (otp: string) => {
    const functions = getFunctions(firebaseApp);
    const verifyFn = httpsCallable(functions, 'verifyEmailWithOTP');
    await verifyFn({ otp });
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

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
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as ProfileData));
  }, [firestore]);

  const getApprovedTeachers = useCallback(async (): Promise<ProfileData[]> => {
    const usersCol = collection(firestore, 'users');
    const q = query(usersCol, where("role", "in", ["teacher", "admin"]));
    const snap = await getDocs(q);
    return snap.docs
        .map(doc => ({ ...doc.data(), uid: doc.id } as ProfileData))
        .filter(u => !EXCLUDED_FROM_TEACHER_LIST.includes(u.email?.toLowerCase()))
        .filter(u => u.role === 'admin' || u.status === 'approved');
  }, [firestore]);

  const getUserTestHistory = useCallback(async (userId: string): Promise<TestResult[]> => {
    const q = query(collection(firestore, 'testResults'), where("userId", "==", userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q); 
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
  }, [firestore]);

  const getUserTestHistoryByDateRange = useCallback(async (userId: string, start: Date, end: Date): Promise<TestResult[]> => {
    const q = query(collection(firestore, 'testResults'), where("userId", "==", userId), where("createdAt", ">=", start), where("createdAt", "<=", end));
    const snap = await getDocs(q); 
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
  }, [firestore]);

  const getUserProfile = useCallback(async (userId: string): Promise<ProfileData | null> => {
    const snap = await getDoc(doc(firestore, 'users', userId));
    return snap.exists() ? { ...snap.data(), uid: snap.id } as ProfileData : null;
  }, [firestore]);
  
  const approveTeacher = useCallback(async (teacherId: string, callback?: () => void) => {
    if (profile?.role !== 'admin') throw new Error('Unauthorized');
    await updateDoc(doc(firestore, 'users', teacherId), { status: 'approved', updatedAt: serverTimestamp() });
    if(callback) callback();
  }, [profile, firestore]);

  const getCompletedGameLevels = useCallback(async (): Promise<number[]> => {
    if (!user) return [];
    const snap = await getDoc(doc(firestore, "gameProgress", user.uid));
    return snap.exists() ? snap.data().completedLevels || [] : [];
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
  }, [firestore]);

  const recordDailyPractice = useCallback(async (userId: string) => {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data = userSnap.data() as ProfileData;
    const today = new Date().toISOString().split('T')[0];
    if (data.lastPracticeDate === today) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const newStreak = data.lastPracticeDate === yesterdayStr ? (data.currentStreak || 0) + 1 : 1;
    await updateDoc(userRef, { lastPracticeDate: today, currentStreak: newStreak, totalDaysPracticed: increment(1), updatedAt: serverTimestamp() });
    await addPoints(userId, 25);
  }, [firestore, addPoints]);

  const getStudentTitle = useCallback((totalDays: number, totalPoints: number) => {
    return RANK_CRITERIA.find(t => totalDays >= t.daysReq && totalPoints >= t.pointsReq) || RANK_CRITERIA[RANK_CRITERIA.length - 1];
  }, []);

  const value = { 
    user, profile, login, signup, loginWithGoogle, logout, isLoading, upgradeToPro, 
    sendPasswordReset, sendVerificationEmail, sendOTP, verifyOTP, updateUserProfile, toggleUserSuspension, deleteUserAccount, getAllUsers, getApprovedTeachers, 
    getUserTestHistory, getUserTestHistoryByDateRange, getUserProfile, approveTeacher, getCompletedGameLevels, 
    saveCompletedGameLevel, fetchProfile, recordDailyPractice, addPoints, getStudentTitle, isTrialActive, trialDaysRemaining
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
