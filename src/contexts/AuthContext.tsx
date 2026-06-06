
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
import { doc, setDoc, getDoc, serverTimestamp, getFirestore, collection, getDocs, query, where, arrayUnion, updateDoc, increment, orderBy, deleteDoc, onSnapshot, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import type { ProfileData, TestResult, SignupData, UserRole, UpdateProfilePayload } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { RANK_CRITERIA, ADMIN_EMAILS, EXCLUDED_FROM_TEACHER_LIST } from '@/lib/constants';

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
  markUserAsRead: (uid: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  upgradeToPro: () => Promise<void>;
  getAllUsers: (role?: UserRole) => Promise<ProfileData[]>;
  getApprovedTeachers: () => Promise<ProfileData[]>;
  getUserTestHistory: (userId: string) => Promise<TestResult[]>;
  getUserTestHistoryByDateRange: (userId: string, start: Date, end: Date) => Promise<TestResult[]>;
  getUserTestHistoryByPeriod: (userId: string, type: 'weekly' | 'monthly') => Promise<TestResult[]>;
  getUserTestHistoryBySession: (userId: string) => Promise<TestResult[]>;
  getUserTestHistoryByPaper: (userId: string, paperId: string) => Promise<TestResult[]>;
  getUserProfile: (userId: string) => Promise<ProfileData | null>;
  approveTeacher: (teacherId: string, callback?: () => void) => Promise<void>;
  getCompletedGameLevels: () => Promise<number[]>;
  saveCompletedGameLevel: (levelId: number) => Promise<void>;
  setLastLevelAttended: (levelId: number) => Promise<void>;
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

const sanitizeForFirestore = (data: any) => {
  const clean: any = {};
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (val !== undefined) {
      clean[key] = (val === '' || val === null) ? null : val;
    }
  });
  return clean;
};

const triggerAutoEmail = (type: string, userEmail: string, userName: string, metadata?: any) => {
  const studentFirstName = userName.split(' ')[0];
  fetch('/api/email/auto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, userEmail, userName: studentFirstName, metadata })
  }).catch(e => console.warn("Failed to trigger auto-email:", e));
};

function getUTCMondayKey() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1); 
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
}

function getUTCMonthKey() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

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
    const userDocRef = doc(firestore, 'users', authUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as ProfileData;
        return { ...data, uid: authUser.uid };
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [firestore]);

  useEffect(() => {
    let profileUnsub: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = undefined;
      }

      if (authUser) {
        setIsLoading(true);
        const userDocRef = doc(firestore, 'users', authUser.uid);
        
        profileUnsub = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as ProfileData;
            const profileData = { ...data, uid: authUser.uid };
            
            const currentWeekKey = getUTCMondayKey();
            const currentMonthKey = getUTCMonthKey();
            const updatePayload: any = {};
            let needsSync = false;

            if (data.lastWeeklyReset !== currentWeekKey) {
                updatePayload.weeklyPoints = 0;
                updatePayload.lastWeeklyReset = currentWeekKey;
                needsSync = true;
            }
            if (data.lastMonthlyReset !== currentMonthKey) {
                updatePayload.monthlyPoints = 0;
                updatePayload.lastMonthlyReset = currentMonthKey;
                needsSync = true;
            }
            if (data.emailVerified !== authUser.emailVerified) {
              updatePayload.emailVerified = authUser.emailVerified;
              needsSync = true;
            }
            const userEmail = authUser.email?.toLowerCase() || '';
            if (ADMIN_EMAILS.includes(userEmail) && data.role !== 'admin') {
                updatePayload.role = 'admin';
                updatePayload.subscriptionStatus = 'pro';
                updatePayload.status = 'approved';
                needsSync = true;
            }

            if (needsSync) {
              updateDoc(userDocRef, updatePayload).catch(e => console.warn("Background sync deferred", e));
            }

            setProfile(profileData);
          } else {
            setProfile(null);
          }
          setIsLoading(false);
        }, (error) => {
          setIsLoading(false);
        });
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, [auth, firestore]);

  useEffect(() => {
    if (!isLoading && profile) {
      if (profile.isSuspended && pathname !== '/suspended') {
        router.replace('/suspended');
        return;
      }
      
      const isProfileIncomplete = profile.role === 'student' && (!profile.grade || !profile.schoolName || !profile.city || !profile.addressLine1);
      const allowedPaths = ['/profile', '/logout', '/suspended', '/login', '/signup', '/'];
      
      if (isProfileIncomplete && !allowedPaths.includes(pathname)) {
        router.replace('/profile');
      }
    }
  }, [profile, isLoading, pathname, router]);

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
      const userEmail = user.email?.toLowerCase() || '';
      const isAdmin = ADMIN_EMAILS.includes(userEmail);
      
      const rawData = {
          ...values,
          email: user.email!,
          emailVerified: isAdmin,
          profilePhoto: photoURL || '',
          createdAt: serverTimestamp(),
          trialStartDate: serverTimestamp(),
          subscriptionStatus: isAdmin ? 'pro' : 'free',
          role: isAdmin ? 'admin' : values.role,
          teacherId: values.teacherId || null, 
          isSuspended: false,
          isAdminRead: false,
          status: isAdmin ? 'approved' : (values.role === 'teacher' ? 'pending' : null),
          currentStreak: 0,
          totalDaysPracticed: 0,
          monthlyPoints: 0,
          weeklyPoints: 0,
          totalPoints: 0,
          lastAwardedRank: 'Math Beginner',
          lastWeeklyReset: getUTCMondayKey(),
          lastMonthlyReset: getUTCMonthKey()
      };
      delete (rawData as any).password;
      delete (rawData as any).confirmPassword;

      await setDoc(userDocRef, sanitizeForFirestore(rawData));
      triggerAutoEmail('welcome', user.email!, values.firstName);
  }, [auth, firestore, storage]);

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
      
      const rawData = {
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
        isAdminRead: false,
        status: isAdmin ? 'approved' : null,
        currentStreak: 0,
        totalDaysPracticed: 0,
        monthlyPoints: 0,
        weeklyPoints: 0,
        totalPoints: 0,
        lastAwardedRank: 'Math Beginner',
        lastWeeklyReset: getUTCMondayKey(),
        lastMonthlyReset: getUTCMonthKey()
      };

      await setDoc(userDocRef, sanitizeForFirestore(rawData));
      triggerAutoEmail('welcome', user.email!, firstName || 'Student');
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
    const payload: any = { ...sanitizeForFirestore(profileData), updatedAt: serverTimestamp() };
    
    if (profilePhoto) {
        const storageRef = ref(storage, `profile_photos/${uid}`);
        await uploadBytes(storageRef, profilePhoto);
        payload.profilePhoto = await getDownloadURL(storageRef);
    }
    await updateDoc(userDocRef, payload);
  }, [firestore, storage]);

  const toggleUserSuspension = useCallback(async (uid: string, isSuspended: boolean) => {
    const userDocRef = doc(firestore, 'users', uid);
    await updateDoc(userDocRef, { isSuspended, updatedAt: serverTimestamp() });
  }, [firestore]);

  const deleteUserAccount = useCallback(async (uid: string) => {
    const userDocRef = doc(firestore, 'users', uid);
    await deleteDoc(userDocRef);
  }, [firestore]);

  const markUserAsRead = useCallback(async (uid: string) => {
    const userDocRef = doc(firestore, 'users', uid);
    await updateDoc(userDocRef, { isAdminRead: true, updatedAt: serverTimestamp() });
  }, [firestore]);

  const upgradeToPro = useCallback(async () => {
    if (!user) return;
    await updateDoc(doc(firestore, 'users', user.uid), { subscriptionStatus: 'pro' });
  }, [user, firestore]);

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

  const getUserTestHistoryBySession = useCallback(async (userId: string): Promise<TestResult[]> => {
    const testCol = collection(firestore, 'testResults');
    const q = query(testCol, where("userId", "==", userId), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q); 
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
  }, [firestore]);

  const getUserTestHistory = useCallback(async (userId: string): Promise<TestResult[]> => {
    const testCol = collection(firestore, 'testResults');
    const q = query(testCol, where("userId", "==", userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q); 
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
  }, [firestore]);

  const getUserTestHistoryByPaper = useCallback(async (userId: string, paperId: string): Promise<TestResult[]> => {
    const testCol = collection(firestore, 'testResults');
    const q = query(testCol, where("userId", "==", userId), where("testId", "==", paperId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q); 
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
  }, [firestore]);

  const getUserTestHistoryByPeriod = useCallback(async (userId: string, type: 'weekly' | 'monthly'): Promise<TestResult[]> => {
    const testCol = collection(firestore, 'testResults');
    const now = new Date();
    let startDate: Date;
    if (type === 'weekly') {
      const day = now.getUTCDay();
      const diff = (day === 0 ? 6 : day - 1);
      startDate = new Date(now);
      startDate.setUTCDate(now.getUTCDate() - diff);
      startDate.setUTCHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
    }
    const q = query(testCol, where("userId", "==", userId), where("createdAt", ">=", startDate), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
  }, [firestore]);

  const getUserTestHistoryByDateRange = useCallback(async (userId: string, start: Date, end: Date): Promise<TestResult[]> => {
    const testCol = collection(firestore, 'testResults');
    const q = query(testCol, where("userId", "==", userId), where("createdAt", ">=", start), where("createdAt", "<=", end));
    const snap = await getDocs(q); 
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as TestResult));
  }, [firestore]);

  const getUserProfile = useCallback(async (userId: string): Promise<ProfileData | null> => {
    const userDocRef = doc(firestore, 'users', userId);
    const snap = await getDoc(userDocRef);
    return snap.exists() ? { ...snap.data(), uid: snap.id } as ProfileData : null;
  }, [firestore]);
  
  const approveTeacher = useCallback(async (teacherId: string, callback?: () => void) => {
    await updateDoc(doc(firestore, 'users', teacherId), { status: 'approved', updatedAt: serverTimestamp() });
    if(callback) callback();
  }, [firestore]);

  const getCompletedGameLevels = useCallback(async (): Promise<number[]> => {
    if (!user) return [];
    const snap = await getDoc(doc(firestore, "gameProgress", user.uid));
    return snap.exists() ? snap.data().completedLevels || [] : [];
  }, [user, firestore]);

  const saveCompletedGameLevel = useCallback(async (levelId: number) => {
    if (!user) return;
    await setDoc(doc(firestore, "gameProgress", user.uid), { completedLevels: arrayUnion(levelId) }, { merge: true });
  }, [user, firestore]);

  const setLastLevelAttended = useCallback(async (levelId: number) => {
    if (!user) return;
    await updateDoc(doc(firestore, "users", user.uid), { lastLevelAttended: levelId, updatedAt: serverTimestamp() });
  }, [user, firestore]);

  const getStudentTitle = useCallback((totalDays: number, totalPoints: number) => {
    return RANK_CRITERIA.find(t => totalDays >= t.daysReq && totalPoints >= t.pointsReq) || RANK_CRITERIA[RANK_CRITERIA.length - 1];
  }, []);

  const addPoints = useCallback(async (userId: string, points: number) => {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data = userSnap.data() as ProfileData;
    
    let earnedPoints = points;
    const nextPoints = (data.totalPoints || 0) + earnedPoints;
    const nextRank = getStudentTitle(data.totalDaysPracticed || 0, nextPoints);
    
    const updateData: any = { updatedAt: serverTimestamp() };
    
    if (nextRank.name !== data.lastAwardedRank) {
      const bonus = nextRank.bonusPoints || 0;
      updateData.lastAwardedRank = nextRank.name;
      updateData.totalPoints = increment(earnedPoints + bonus);
      
      triggerAutoEmail('achievement', data.email, data.firstName, { 
        rankName: nextRank.name, 
        rankIcon: nextRank.icon, 
        totalPoints: (data.totalPoints || 0) + earnedPoints + bonus
      });
    } else {
      updateData.totalPoints = increment(earnedPoints);
    }
    
    const currentWeekKey = getUTCMondayKey();
    const currentMonthKey = getUTCMonthKey();
    if (data.lastWeeklyReset !== currentWeekKey) { updateData.weeklyPoints = earnedPoints; updateData.lastWeeklyReset = currentWeekKey; } else { updateData.weeklyPoints = increment(earnedPoints); }
    if (data.lastMonthlyReset !== currentMonthKey) { updateData.monthlyPoints = earnedPoints; updateData.lastMonthlyReset = currentMonthKey; } else { updateData.monthlyPoints = increment(earnedPoints); }
    
    await updateDoc(userRef, updateData);
  }, [firestore, getStudentTitle]);

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
    
    const currentDays = data.totalDaysPracticed || 0;
    const dayInCycle = (currentDays % 28) + 1; 
    let bonusDays = 0;
    if (dayInCycle === 14) bonusDays = 1; 
    if (dayInCycle === 28) bonusDays = 1; 

    await updateDoc(userRef, { lastPracticeDate: today, currentStreak: newStreak, totalDaysPracticed: increment(1 + bonusDays), updatedAt: serverTimestamp() });
    await addPoints(userId, 25);
  }, [firestore, addPoints]);

  const contextValue = useMemo(() => ({ 
    user, profile, login, signup, loginWithGoogle, logout, isLoading, upgradeToPro, 
    sendPasswordReset, sendVerificationEmail, updateUserProfile, toggleUserSuspension, deleteUserAccount, markUserAsRead, getAllUsers, getApprovedTeachers, 
    getUserTestHistory, getUserTestHistoryByDateRange, getUserTestHistoryByPeriod, getUserTestHistoryBySession, getUserTestHistoryByPaper, getUserProfile, approveTeacher, getCompletedGameLevels, 
    saveCompletedGameLevel, setLastLevelAttended, fetchProfile, recordDailyPractice, addPoints, getStudentTitle, isTrialActive, trialDaysRemaining
  }), [user, profile, login, signup, loginWithGoogle, logout, isLoading, upgradeToPro, 
    sendPasswordReset, sendVerificationEmail, updateUserProfile, toggleUserSuspension, deleteUserAccount, markUserAsRead, getAllUsers, getApprovedTeachers, 
    getUserTestHistory, getUserTestHistoryByDateRange, getUserTestHistoryByPeriod, getUserTestHistoryBySession, getUserTestHistoryByPaper, getUserProfile, approveTeacher, getCompletedGameLevels, 
    saveCompletedGameLevel, setLastLevelAttended, fetchProfile, recordDailyPractice, addPoints, getStudentTitle, isTrialActive, trialDaysRemaining]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
