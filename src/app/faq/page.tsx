
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { HelpCircle, Trophy, Target, Users, BookOpen, Sparkles, Gift } from 'lucide-react';
import { RANK_CRITERIA } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const faqs = [
  {
    question: 'What is My Abacus Pro?',
    answer:
      'My Abacus Pro is an advanced digital training ground for mental math. We use timed challenges, visual bead recognition tests, and engaging games to help students master the Japanese Abacus (Soroban) techniques and achieve lightning-fast calculation speeds.',
  },
  {
    category: 'Eligibility',
    question: 'Who is eligible to join My Abacus Pro?',
    answer:
      'Our platform is designed for three main groups: 1) Students (ages 5+) who want to master mental arithmetic and climb the global ranks. 2) Teachers who want to monitor their students\' progress and provide structured digital homework. 3) Adults who wish to keep their cognitive skills sharp through regular mathematical exercise.',
  },
  {
    category: 'Points',
    question: 'How exactly are Mastery Points and Rewards calculated?',
    answer:
      'Your Mastery Points are earned through effort, speed, and precision: \n\n• **Consistency**: +25 points for your first practice session each day. \n• **Accuracy**: +1 point per right answer in Tests and Game. \n• **Completion**: +5 points for finishing any practice session. \n• **Speed Bonus**: Earn +5 points (Green Light) or +2 points (Yellow Light) in timed tests. \n• **Game Mastery**: +20 points for clearing Bubble Game levels with 90% accuracy.',
  },
  {
    category: 'Rewards',
    question: 'What are the special Milestone & Birthday bonuses?',
    answer:
      'We love celebrating your growth! These special rewards are prestigious additions to your Global career score: \n\n• **Rank-Up Bonus**: Reaching a new Title (like Math Ninja or Titan) awards a progressive point bonus (+50 to +5,000 pts). These are added directly to your Global score. \n• **Birthday Gift**: Log in on your birthday for an automatic +100 point Mastery boost (added to Global score only). \n• **Milestone Days**: Practice for 14 or 28 days straight to receive "Bonus Progress" days toward your training cycle.',
  },
  {
    category: 'Leaderboard',
    question: 'How do the Hall of Fame Leaderboards work?',
    answer:
      'We maintain three distinct leaderboards to keep competition fresh: \n\n• Weekly: Tracks points from active practice (Sunday to Sunday). It resets every week, giving everyone a fresh chance to be #1. \n• Monthly: Tracks active performance within the calendar month. \n• Global: An all-time leaderboard showing total career progress, including all rank-up and birthday bonuses. \n\nNote: Rank-up and Birthday bonuses are added to Global score only, while practice points are added to all three.',
  },
  {
    question: 'Do I need a physical abacus to use this site?',
    answer:
      'No! While a physical abacus is great for tactile learning, our "Beads Value" mode and the "Abacus Tool" page provide a high-fidelity digital abacus. Many students use our site to practice "Anzan" (mental visualization of the abacus).',
  },
  {
    question: 'What are Small Sister, Big Brother, and Combination formulas?',
    answer:
      'These are core Soroban techniques: "Small Sister" formulas use the base-5 (heavenly bead) logic. "Big Brother" formulas use base-10 logic. "Combinations" are advanced techniques that use both base-5 and base-10 simultaneously for complex addition and subtraction.',
  },
  {
    category: 'Ranks',
    question: 'What are the Rank and Title criteria?',
    answer: 'Titles are awarded based on total points and practice consistency. Each title includes a Rank-Up point bonus.',
    isCustom: true
  },
  {
    question: 'What does the Pro Membership offer?',
    answer:
      'Pro members get unlimited access to all 1,000+ game levels, all formula-specific practice tests, official final exams for certification, advanced progress analytics, and a completely ad-free experience.',
  },
];

export default function FAQPage() {
    usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/faq_bg.jpg?alt=media');
  
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <HelpCircle className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-headline font-bold">Help & Support</CardTitle>
                    <CardDescription className="text-lg">Master the rules of the road to become a Human Calculator.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-xl px-2 sm:px-6">
                                <AccordionTrigger className="text-base sm:text-lg font-semibold hover:no-underline py-6">
                                    <div className="flex items-center gap-3 text-left">
                                        {faq.category === 'Leaderboard' && <Trophy className="w-5 h-5 text-yellow-500" />}
                                        {faq.category === 'Points' && <Target className="text-primary w-5 h-5" />}
                                        {faq.category === 'Eligibility' && <Users className="w-5 h-5 text-blue-500" />}
                                        {faq.category === 'Ranks' && <BookOpen className="w-5 h-5 text-green-500" />}
                                        {faq.category === 'Rewards' && <Gift className="w-5 h-5 text-pink-500" />}
                                        <span className="leading-tight">{faq.question}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap pb-6">
                                    {faq.isCustom ? (
                                        <div className="space-y-4">
                                            <p>{faq.answer}</p>
                                            <div className="border rounded-lg overflow-hidden max-w-full overflow-x-auto">
                                                <Table>
                                                    <TableHeader className="bg-muted/50">
                                                        <TableRow>
                                                            <TableHead className="w-[100px] sm:w-[180px] px-2 sm:px-4">Rank</TableHead>
                                                            <TableHead className="text-center px-1 sm:px-4">Points</TableHead>
                                                            <TableHead className="text-center px-1 sm:px-4 text-primary">Bonus</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {RANK_CRITERIA.slice().reverse().map((rank) => (
                                                            <TableRow key={rank.name} className="h-12 hover:bg-muted/30">
                                                                <TableCell className="font-bold py-2 px-2 sm:px-4 min-w-[100px]">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="inline-block w-5 text-center shrink-0">{rank.icon}</span>
                                                                        <span className="text-[10px] sm:text-sm leading-tight">{rank.name}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-center text-[11px] sm:text-sm py-2 px-1 sm:px-4 font-medium">{rank.pointsReq.toLocaleString()}+</TableCell>
                                                                <TableCell className="text-center text-[11px] sm:text-sm py-2 px-1 sm:px-4 font-black text-primary">
                                                                  {rank.bonusPoints > 0 ? `+${rank.bonusPoints}` : '---'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ) : faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
