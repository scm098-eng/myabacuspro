
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData, UserRole } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, UserCheck, Users, Briefcase, Crown, User, CheckCircle, Cake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { isWithinInterval, add, parseISO, getDay, getMonth } from 'date-fns';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const isBirthdaySoon = (dob: string) => {
    if (!dob) return false;
    const today = new Date();
    const birthday = parseISO(dob);
    const nextBirthday = new Date(today.getFullYear(), getMonth(birthday), getDay(birthday));
    
    // If birthday has already passed this year, check for next year
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    return isWithinInterval(nextBirthday, { start: today, end: add(today, { days: 7 }) });
};

const isBirthdayToday = (dob: string) => {
    if (!dob) return false;
    const today = new Date();
    const birthday = parseISO(dob);
    return getMonth(today) === getMonth(birthday) && getDay(today) === getDay(birthday);
}

export default function AdminDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media&token=c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9');
  const { user, profile, getAllUsers, approveTeacher, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        if (profile?.role === 'admin' || profile?.role === 'teacher') {
            const users = await getAllUsers();
            setAllUsers(users);
        }
    } catch(e) {
        console.error("Failed to fetch users", e)
    } finally {
        setIsLoading(false);
    }
  }, [getAllUsers, profile]);

  useEffect(() => {
    if (!authLoading) {
      if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        router.push('/');
        return;
      }
      if (profile.role === 'teacher' && profile.status !== 'approved') {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [authLoading, profile, router, fetchData]);

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      await approveTeacher(teacherId);
      toast({
        title: 'Teacher Approved',
        description: 'The teacher can now log in and see their students. The list will update on refresh.',
      });
      // After approval, refetch the data to update the UI
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not approve teacher. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const { teachers, students, pendingTeachers, summaryStats, upcomingBirthdays } = useMemo(() => {
    const allTeachers = allUsers.filter(u => u.role === 'teacher');
    const allStudents = allUsers.filter(u => u.role === 'student');
    const birthdays = allUsers.filter(u => isBirthdaySoon(u.dob)).sort((a,b) => (parseISO(a.dob).getMonth()*31 + parseISO(a.dob).getDate()) - (parseISO(b.dob).getMonth()*31 + parseISO(b.dob).getDate()));

    const pending = allTeachers.filter(t => t.status === 'pending');
    
    let dashboardStudents: ProfileData[];
    if(profile?.role === 'admin') {
      dashboardStudents = allStudents;
    } else { // teacher
      dashboardStudents = allUsers.filter(u => u.teacherId === user?.uid);
    }
    
    const teacherStudentMap = allStudents.reduce((acc, student) => {
        if(student.teacherId) {
            if(!acc[student.teacherId]) {
                acc[student.teacherId] = { pro: 0, free: 0, total: 0 };
            }
            if(student.subscriptionStatus === 'pro') {
                acc[student.teacherId].pro++;
            } else {
                acc[student.teacherId].free++;
            }
            acc[student.teacherId].total++;
        }
        return acc;
    }, {} as Record<string, { pro: number, free: number, total: number }>);

    const teachersWithCounts = allTeachers.map(t => ({
        ...t, 
        studentCounts: teacherStudentMap[t.uid] || { pro: 0, free: 0, total: 0 }
    }));
    
    const studentsWithTeacherNames = dashboardStudents.map(student => {
        const teacher = allTeachers.find(t => t.uid === student.teacherId);
        return {
            ...student,
            teacherName: teacher ? `${teacher.firstName} ${teacher.surname}` : 'N/A'
        }
    });

    const stats = {
        totalTeachers: allTeachers.length,
        totalStudents: allStudents.length,
        proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length,
        freeUsers: allStudents.filter(s => s.subscriptionStatus !== 'pro').length,
    }

    return { 
        teachers: teachersWithCounts, 
        students: studentsWithTeacherNames, 
        pendingTeachers: pending, 
        summaryStats: stats,
        upcomingBirthdays: birthdays
    };
  }, [allUsers, profile, user]);


  if (isLoading || authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{profile?.role === 'admin' ? 'Admin' : 'Teacher'} Dashboard</CardTitle>
          <CardDescription>
            {profile?.role === 'admin' 
              ? 'An overview of all users in the system.' 
              : 'A list of your registered students.'}
          </CardDescription>
        </CardHeader>
        {profile?.role === 'admin' && (
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Teachers" value={summaryStats.totalTeachers} icon={Briefcase} />
                <StatCard title="Total Students" value={summaryStats.totalStudents} icon={Users} />
                <StatCard title="Pro Users" value={summaryStats.proUsers} icon={Crown} />
                <StatCard title="Free Users" value={summaryStats.freeUsers} icon={User} />
            </CardContent>
        )}
      </Card>

      {profile?.role === 'admin' && upcomingBirthdays.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Cake className="text-pink-500"/> Upcoming Birthdays
                  </CardTitle>
                  <CardDescription>Users with birthdays in the next 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Birthday</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {upcomingBirthdays.map((u) => (
                              <TableRow key={u.uid}>
                                  <TableCell>{u.firstName} {u.surname}</TableCell>
                                  <TableCell className="capitalize">{u.role}</TableCell>
                                  <TableCell>
                                      {isBirthdayToday(u.dob) ? (
                                        <Badge className="bg-pink-500/20 text-pink-700 border-pink-400">Today!</Badge>
                                      ) : (
                                        new Date(u.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                                      )}
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
      )}
      
      {profile?.role === 'admin' && pendingTeachers.length > 0 && (
         <Card>
            <CardHeader>
              <CardTitle>Pending Teacher Approvals</CardTitle>
              <CardDescription>These teachers are waiting for approval to access their dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Teacher ID</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pendingTeachers.map((teacher) => (
                    <TableRow key={teacher.uid}>
                      <TableCell><div className="font-medium">{`${teacher.firstName} ${teacher.surname}`}</div></TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell><div className="font-mono text-xs">{teacher.uid}</div></TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => handleApproveTeacher(teacher.uid)} size="sm">
                          <UserCheck className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      )}

      {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
                <CardTitle>Teachers</CardTitle>
                <CardDescription>List of all approved and pending teachers.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Students</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {teachers.length > 0 ? teachers.map((teacher) => (
                            <TableRow key={teacher.uid}>
                                <TableCell><div className="font-medium">{teacher.firstName} {teacher.surname}</div></TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>
                                     <Badge variant={teacher.status === 'approved' ? 'default' : 'secondary'} className={teacher.status === 'approved' ? 'bg-green-500/20 text-green-700 border-green-400' : ''}>
                                      {teacher.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{teacher.studentCounts.total}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                      <Link href={`/admin/user/${teacher.uid}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={5} className="text-center">No teachers found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
           <CardDescription>
            {profile?.role === 'admin' ? 'A list of all registered students in the system.' : 'A list of your students.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                {profile?.role === 'admin' && <TableHead>Assigned Teacher</TableHead>}
                <TableHead className="hidden md:table-cell">Subscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? students.map((student) => (
                <TableRow key={student.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.profilePhoto} />
                        <AvatarFallback>{student.firstName?.[0]}{student.surname?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{`${student.firstName} ${student.surname}`}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  {profile?.role === 'admin' && <TableCell>{student.teacherName}</TableCell>}
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={student.subscriptionStatus === 'pro' ? 'default' : 'secondary'} className={student.subscriptionStatus === 'pro' ? 'bg-green-500/20 text-green-700 border-green-400' : ''}>
                      {student.subscriptionStatus === 'pro' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {student.subscriptionStatus || 'free'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/user/${student.uid}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={profile?.role === 'admin' ? 5 : 4} className="text-center">No students found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
