
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'What is My Abacus Pro?',
    answer:
      'My Abacus Pro is an online platform designed to help students of all ages improve their mental arithmetic skills through timed practice tests and engaging games based on abacus techniques.',
  },
  {
    question: 'Who is this platform for?',
    answer:
      'The platform is for everyone! It is beneficial for young students learning the abacus, older students preparing for competitive exams, and any adult who wants to keep their mind sharp and improve their calculation speed.',
  },
  {
    question: 'Do I need a physical abacus to use this site?',
    answer:
      'While having a physical abacus can be helpful for beginners, it is not required. Our "Beads Value" tests and "Tool Preview" page are designed to help you visualize and understand the abacus digitally.',
  },
  {
    question: 'What is the difference between Small Sister, Big Brother, and Combination formulas?',
    answer:
      'These are different sets of techniques used in abacus mathematics to simplify addition and subtraction. "Small Sister" formulas use combinations of 5, "Big Brother" formulas use combinations of 10, and "Combination" formulas are a mix of both for more complex problems.',
  },
    {
    question: 'How do I track my progress?',
    answer:
      'You can visit the "Progress Report" page from your user profile menu. It provides detailed statistics on your test history, accuracy trends, and time spent practicing.',
  },
  {
    question: 'What does the Pro Membership offer?',
    answer:
      'Upgrading to a Pro Membership gives you unlimited access to all practice tests, difficulty levels, and detailed progress tracking. It\'s the best way to unlock your full potential!',
  },
];


export default function FAQPage() {
    usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/faq_bg.jpg?alt=media');
  
    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <HelpCircle className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-headline">Frequently Asked Questions</CardTitle>
                    <CardDescription>Find answers to common questions about My Abacus Pro.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
