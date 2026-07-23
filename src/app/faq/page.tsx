'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { HelpCircle, Trophy, Target, Users, BookOpen, Sparkles, Gift, Zap, Swords, LayoutGrid } from 'lucide-react';
import { RANK_CRITERIA } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const faqs = [
  {
    question: 'What is My Abacus Pro?',
    answer:
      'My Abacus Pro is an advanced digital training ground for mental math. We use timed challenges, visual bead recognition tests, and engaging games to help students master the Japanese Abacus (Soroban) techniques and achieve lightning-fast calculation speeds.',
  },
  {
    category: 'Game Hub',
    question: 'What is the Game Hub?',
    answer:
      'The Game Hub is our dedicated missions center. It currently features three distinct training modes: \n\n• **Bubble Game**: A 1,000-level formula mastery quest. \n• **Matrix Flash**: A spatial visualization drill to sharpen your "Mental Snapshot" ability. \n• **1v1 Duels**: A competitive arena where you can challenge friends or simulated global opponents to real-time math races.',
  },
  {
    category: 'Bot Matchmaking',
    question: 'How does Duel Matchmaking work?',
    answer:
      'To ensure you always find an opponent instantly, our system uses hybrid matchmaking. We search for a real online student for 6 seconds. If no one is available, an intelligent bot matches your skill level to start the duel immediately, so you never wait for a loading screen.',
  },
  {
    category: 'Anzan',
    question: 'What is Flash Card Anzan?',
    answer:
      'Flash Card Anzan is an elite mental arithmetic drill. Numbers flash sequentially on the screen at high speeds, and you must calculate the total mentally. Pro members can access the "Custom Lab" to practice with up to 50 rows of numbers at speeds as fast as 0.2 seconds per flash.',
  },
  {
    category: 'Eligibility',
    question: 'Who is eligible to join My Abacus Pro?',
    answer:
      'Our platform is designed for three main groups: 1) Students (ages 5+) who want to master mental arithmetic. 2) Teachers who want to monitor their students\' progress. 3) Adults who wish to keep their cognitive skills sharp through regular mathematical exercise.',
  },
  {
    category: 'Rewards',
    question: 'How exactly are Mastery Points earned?',
    answer:
      'Mastery Points represent your growth: \n\n• **Daily Consistency**: +25 points for your first practice session each day. \n• **Accuracy**: +1 point per right answer in Tests and Game. \n• **Speed Bonus**: Up to +5 bonus points in timed tests based on your pace. \n• **Duel Winner**: +50 points for winning a match against a human or bot. \n• **Achievement Bonus**: Significant point bonuses awarded automatically when you achieve a new Rank (added to Global points only).',
  },
  {
    category: 'Ranks',
    question: 'What are the Rank and Title criteria?',
    answer: 'Titles are awarded based on total points and practice consistency. Each achievement adds a significant Mastery Bonus to your Global score.',
    isCustom: true
  },
];

export default function FAQPage() {
    usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/faq_bg.jpg?alt=media');
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4"><HelpCircle className="w-10 h-10 text-primary" /></div>
                    <CardTitle className="text-4xl font-headline font-bold">Help & Support</CardTitle>
                    <CardDescription className="text-lg font-medium">Master the rules of the road to become a Human Calculator on My Abacus Pro.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-xl px-2 sm:px-6">
                                <AccordionTrigger className="text-base sm:text-lg font-semibold hover:no-underline py-6">
                                    <div className="flex items-center gap-3 text-left">
                                        {faq.category === 'Bot Matchmaking' && <Swords className="w-5 h-5 text-orange-500" />}
                                        {faq.category === 'Game Hub' && <LayoutGrid className="w-5 h-5 text-teal-500" />}
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
                                                            <TableHead className="px-4">Rank</TableHead>
                                                            <TableHead className="text-center px-4">Days</TableHead>
                                                            <TableHead className="text-center px-4">Points</TableHead>
                                                            <TableHead className="text-center px-4">Bonus</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {RANK_CRITERIA.slice().reverse().map((rank) => (
                                                            <TableRow key={rank.name} className="h-12 hover:bg-muted/30">
                                                                <TableCell className="font-bold py-2 px-4 min-w-[150px]"><span className="mr-2">{rank.icon}</span>{rank.name}</TableCell>
                                                                <TableCell className="text-center py-2 px-4 font-medium">{rank.daysReq}+</TableCell>
                                                                <TableCell className="text-center py-2 px-4 font-medium">{rank.pointsReq.toLocaleString()}+</TableCell>
                                                                <TableCell className="text-center py-2 px-4 font-black text-primary">+{rank.bonusPoints.toLocaleString()}</TableCell>
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
