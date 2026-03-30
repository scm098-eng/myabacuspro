
export type TestType =
  | 'addition-subtraction'
  | 'multiplication'
  | 'division'
  | 'beads-identify'
  | 'beads-set'
  | 'basic-add-sub-l1'
  | 'basic-add-sub-l2'
  | 'basic-addition-plus-4'
  | 'basic-addition-plus-40'
  | 'basic-addition-plus-3'
  | 'basic-addition-plus-30'
  | 'basic-addition-plus-2'
  | 'basic-addition-plus-20'
  | 'basic-addition-plus-1'
  | 'basic-addition-plus-10'
  | 'basic-subtraction-minus-4'
  | 'basic-subtraction-minus-40'
  | 'basic-subtraction-minus-3'
  | 'basic-subtraction-minus-30'
  | 'basic-subtraction-minus-2'
  | 'basic-subtraction-minus-20'
  | 'basic-subtraction-minus-1'
  | 'basic-subtraction-minus-10'
  | 'big-brother-addition-plus-9'
  | 'big-brother-addition-plus-90'
  | 'big-brother-addition-plus-8'
  | 'big-brother-addition-plus-80'
  | 'big-brother-addition-plus-7'
  | 'big-brother-addition-plus-70'
  | 'big-brother-addition-plus-6'
  | 'big-brother-addition-plus-60'
  | 'big-brother-addition-plus-5'
  | 'big-brother-addition-plus-50'
  | 'big-brother-addition-plus-4'
  | 'big-brother-addition-plus-40'
  | 'big-brother-addition-plus-3'
  | 'big-brother-addition-plus-30'
  | 'big-brother-addition-plus-2'
  | 'big-brother-addition-plus-20'
  | 'big-brother-addition-plus-1'
  | 'big-brother-addition-plus-10'
  | 'big-brother-subtraction-minus-9'
  | 'big-brother-subtraction-minus-90'
  | 'big-brother-subtraction-minus-8'
  | 'big-brother-subtraction-minus-80'
  | 'big-brother-subtraction-minus-7'
  | 'big-brother-subtraction-minus-70'
  | 'big-brother-subtraction-minus-6'
  | 'big-brother-subtraction-minus-60'
  | 'big-brother-subtraction-minus-5'
  | 'big-brother-subtraction-minus-50'
  | 'big-brother-subtraction-minus-4'
  | 'big-brother-subtraction-minus-40'
  | 'big-brother-subtraction-minus-3'
  | 'big-brother-subtraction-minus-30'
  | 'big-brother-subtraction-minus-2'
  | 'big-brother-subtraction-minus-20'
  | 'big-brother-subtraction-minus-1'
  | 'big-brother-subtraction-minus-10'
  | 'combination-plus-6'
  | 'combination-plus-60'
  | 'combination-plus-7'
  | 'combination-plus-70'
  | 'combination-plus-8'
  | 'combination-plus-80'
  | 'combination-plus-9'
  | 'combination-plus-90'
  | 'combination-minus-6'
  | 'combination-minus-60'
  | 'combination-minus-7'
  | 'combination-minus-70'
  | 'combination-minus-8'
  | 'combination-minus-80'
  | 'combination-minus-9'
  | 'combination-minus-90'
  | 'mastery-mix-1'
  | 'mastery-mix-2'
  | 'mastery-mix-3'
  | 'mastery-mix-4'
  | 'mastery-mix-5'
  | 'mastery-mix-6'
  | 'mastery-mix-7'
  | 'mastery-mix-8'
  | 'mastery-mix-9'
  | 'mastery-mix-10'
  | 'mastery-mix-11'
  | 'mastery-mix-12'
  | 'bubble-game';

export type GameLevel =
  | 'small-sister-plus-4'
  | 'small-sister-plus-3'
  | 'small-sister-plus-2'
  | 'small-sister-plus-1'
  | 'small-sister-minus-4'
  | 'small-sister-minus-3'
  | 'small-sister-minus-2'
  | 'small-sister-minus-1'
  | 'small-sister-all'
  | 'big-brother-plus-9'
  | 'big-brother-plus-8'
  | 'big-brother-plus-7'
  | 'big-brother-plus-6'
  | 'big-brother-plus-5'
  | 'big-brother-plus-4'
  | 'big-brother-plus-3'
  | 'big-brother-plus-2'
  | 'big-brother-plus-1'
  | 'big-brother-minus-9'
  | 'big-brother-minus-8'
  | 'big-brother-minus-7'
  | 'big-brother-minus-6'
  | 'big-brother-minus-5'
  | 'big-brother-minus-4'
  | 'big-brother-minus-3'
  | 'big-brother-minus-2'
  | 'big-brother-minus-1'
  | 'big-brother-all'
  | 'combination-plus-9'
  | 'combination-plus-8'
  | 'combination-plus-7'
  | 'combination-plus-6'
  | 'combination-minus-9'
  | 'combination-minus-8'
  | 'combination-minus-7'
  | 'combination-minus-6'
  | 'combination-all'
  | 'general-practice'
  | 'mastery-mix-1'
  | 'mastery-mix-2'
  | 'mastery-mix-3'
  | 'mastery-mix-4'
  | 'mastery-mix-5'
  | 'mastery-mix-6'
  | 'mastery-mix-7'
  | 'mastery-mix-8'
  | 'mastery-mix-9'
  | 'mastery-mix-10'
  | 'mastery-mix-11'
  | 'mastery-mix-12';

export type Difficulty = 'easy' | 'medium' | 'hard' | string;

export type BeadQuestionType = 'identify' | 'set';

export interface Question {
  text: string;
  options: number[];
  answer: number;
  questionType?: BeadQuestionType;
}

export interface TestSettings {
  numQuestions: number;
  timeLimit: number; // in seconds, 0 for no limit
  title: string;
  icon: 'brain-circuit' | 'x' | 'divide' | 'puzzle' | 'eye';
}

export type SubscriptionStatus = 'free' | 'pro' | 'active';
export type UserRole = 'student' | 'teacher' | 'admin';
export type TeacherStatus = 'pending' | 'approved';

export type SignupData = {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  middleName?: string;
  surname: string;
  dob: string;
  country?: string;
  addressLine1?: string;
  city?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  schoolName?: string;
  grade?: string;
  mobileNo?: string;
  whatsappNo?: string;
  profilePhoto?: File | null;
  role: UserRole;
  teacherId?: string;
  instituteName?: string;
  instituteCountry?: string;
  instituteAddressLine1?: string;
  instituteCity?: string;
  instituteTaluka?: string;
  instituteDistrict?: string;
  instituteState?: string;
  institutePincode?: string;
};

export interface ProfileData {
  uid: string;
  email: string;
  firstName: string;
  middleName?: string;
  surname: string;
  dob: string; 
  subscriptionType?: 'recurring' | 'one-time' | 'none';
  activeTier?: 'monthly' | '6months' | '12months' | 'annual';
  lastPaymentId?: string;
  country?: string;
  addressLine1?: string;
  city?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  schoolName?: string;
  grade?: string;
  mobileNo?: string;
  whatsappNo?: string;
  profilePhoto?: string; 
  createdAt?: any;
  subscriptionStatus?: SubscriptionStatus;
  role: UserRole;
  teacherId?: string | null;
  status?: TeacherStatus; 
  isAdmin?: boolean; 
  instituteName?: string;
  instituteCountry?: string;
  instituteAddressLine1?: string;
  instituteCity?: string;
  instituteTaluka?: string;
  instituteDistrict?: string;
  instituteState?: string;
  institutePincode?: string;
  instituteAddress?: string;
  lastPracticeDate?: string;
  currentStreak?: number;
  totalDaysPracticed?: number;
  monthlyPoints?: number;
  weeklyPoints?: number;
  totalPoints?: number;
  lastWeeklyReset?: string;
  lastMonthlyReset?: string;
  fcmToken?: string;
  lastAwardedRank?: string;
  isSuspended?: boolean;
  emailVerified?: boolean;
  trialStartDate?: any;
  lastMarketingEmailSent?: any;
  marketingCampaignClicked?: boolean;
  lastCampaignClicked?: string;
  lastLevelAttended?: number;
}

export type UpdateProfilePayload = {
  firstName: string;
  middleName?: string;
  surname: string;
  dob: string;
  country?: string;
  addressLine1?: string;
  city?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  schoolName?: string;
  grade?: string;
  mobileNo?: string;
  whatsappNo?: string;
  teacherId?: string;
  instituteName?: string;
  instituteCountry?: string;
  instituteAddressLine1?: string;
  instituteCity?: string;
  instituteTaluka?: string;
  instituteDistrict?: string;
  instituteState?: string;
  institutePincode?: string;
  profilePhoto?: File;
  fcmToken?: string;
  lastAwardedRank?: string;
  isSuspended?: boolean;
  trialStartDate?: any;
  emailVerified?: boolean;
  lastLevelAttended?: number;
};


export interface TestResult {
  id: string;
  userId: string;
  testId: TestType;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number; 
  timeLeft: number; 
  createdAt: Date;
  earnedPoints?: number;
  questions?: Question[];
  userAnswers?: (number | null)[];
  isGame?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  image: string;
  createdAt: any;
  // Dynamic Style Settings
  layout?: 'standard' | 'centered' | 'magazine';
  fontFamily?: 'serif' | 'sans' | 'modern';
  lineSpacing?: 'normal' | 'relaxed' | 'wide';
  dropCap?: boolean;
  headlineWeight?: 'bold' | 'black';
  headlineCase?: 'normal' | 'uppercase';
  headlineSpacing?: 'tight' | 'normal' | 'wide';
  accentColor?: string;
}
