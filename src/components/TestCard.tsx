
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TestType } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useRouter } from 'next/navigation';

interface TestCardProps {
  testId: TestType;
  title: string;
  description: string;
  Icon: React.ElementType;
  iconBg: string;
  isFormula?: boolean;
}

export function TestCard({ testId, title, description, Icon, iconBg, isFormula = false }: TestCardProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const isBeadTest = testId === 'beads-identify' || testId === 'beads-set';
  const isPro = profile?.subscriptionStatus === 'pro';
  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';

  // Lock if not logged in, or if a student without pro (for non-bead tests)
  const isLocked = !user || (!isAdminOrTeacher && !isPro && !isBeadTest);


  const handleButtonClick = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!user) {
        router.push('/login');
        return;
    }
    if (isLocked) {
      router.push('/pricing');
    } else {
      router.push(`/tests/${testId}/${difficulty}`);
    }
  };

  const handleFormulaButtonClick = () => {
    if (!user) {
        router.push('/login');
        return;
    }
    if (isLocked) {
      router.push('/pricing');
    } else {
      router.push(`/tests/${testId}/easy`);
    }
  };


  const buttonContent = (difficulty: string) => (
      <div className="flex items-center justify-center">
        {isLocked && <Lock className="w-4 h-4 mr-2" />}
        {difficulty}
      </div>
  );
  
  const formulaButtonContent = () => (
       <div className="flex items-center justify-center">
        {isLocked && <Lock className="w-4 h-4 mr-2" />}
        Practice
      </div>
  );

  return (
    <Card className="flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
      <CardHeader className="flex-col items-center text-center">
        <div className={cn("p-4 rounded-full mb-4 w-fit", iconBg)}>
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <TooltipProvider>
          {isFormula ? (
             <div className="w-full flex flex-col sm:flex-row gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleFormulaButtonClick} className="flex-1" variant="outline">
                            {formulaButtonContent()}
                        </Button>
                    </TooltipTrigger>
                    {isLocked && user && <TooltipContent><p>Upgrade to Pro to access this test.</p></TooltipContent>}
                </Tooltip>
             </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => handleButtonClick('easy')} className="flex-1" variant="outline">
                     {buttonContent('Easy')}
                  </Button>
                </TooltipTrigger>
                {isLocked && user && <TooltipContent><p>Upgrade to Pro to access this test.</p></TooltipContent>}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button onClick={() => handleButtonClick('medium')} className="flex-1" variant="secondary">
                      {buttonContent('Medium')}
                   </Button>
                </TooltipTrigger>
                {isLocked && user && <TooltipContent><p>Upgrade to Pro to access this test.</p></TooltipContent>}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => handleButtonClick('hard')} className="flex-1">
                      {buttonContent('Hard')}
                  </Button>
                </TooltipTrigger>
                {isLocked && user && <TooltipContent><p>Upgrade to Pro to access this test.</p></TooltipContent>}
              </Tooltip>
            </div>
          )}
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
