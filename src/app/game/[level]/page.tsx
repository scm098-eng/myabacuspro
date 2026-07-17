
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BubbleGame } from '@/components/BubbleGame';
import type { GameLevel } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Swords, User, Users, ChevronRight, Share2 } from 'lucide-react';
import { startMatchmaking, getRecentOpponents } from '@/lib/matchmaking';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

/**
 * Dynamic Level Engine (Sync for Deployment)
 * Ensures level 51+ works on the live website.
 */
const getLevelInfo = (levelSlug: string): { type: GameLevel, name: string } | null => {
    const levelId = parseInt(levelSlug.replace('level-', ''), 10);
    if (isNaN(levelId) || levelId < 1) return null;

    if (levelId <= 8) {
        const types: GameLevel[] = [
            'small-sister-plus-4', 'small-sister-plus-3', 'small-sister-plus-2', 'small-sister-plus-1',
            'small-sister-minus-4', 'small-sister-minus-3', 'small-sister-minus-2', 'small-sister-minus-1'
        ];
        return { type: types[levelId - 1], name: `Level ${levelId}: Small Sister` };
    }
    if (levelId === 9) return { type: 'small-sister-all', name: 'Level 9: Small Sister Challenge' };
    
    if (levelId >= 10 && levelId <= 27) {
        const bigBrotherTypes: GameLevel[] = [
            'big-brother-plus-9', 'big-brother-plus-8', 'big-brother-plus-7', 'big-brother-plus-6', 'big-brother-plus-5',
            'big-brother-plus-4', 'big-brother-plus-3', 'big-brother-plus-2', 'big-brother-plus-1',
            'big-brother-minus-9', 'big-brother-minus-8', 'big-brother-minus-7', 'big-brother-minus-6', 'big-brother-minus-5',
            'big-brother-minus-4', 'big-brother-minus-3', 'big-brother-minus-2', 'big-brother-minus-1'
        ];
        return { type: bigBrotherTypes[levelId - 10], name: `Level ${levelId}: Big Brother` };
    }
    if (levelId === 28) return { type: 'big-brother-all', name: 'Level 28: Big Brother Challenge' };

    if (levelId >= 29 && levelId <= 36) {
        const combiTypes: GameLevel[] = [
            'combination-plus-9', 'combination-plus-8', 'combination-plus-7', 'combination-plus-6',
            'combination-minus-9', 'combination-minus-8', 'combination-minus-7', 'combination-minus-6'
        ];
        return { type: combiTypes[levelId - 29], name: `Level ${levelId}: Combination` };
    }
    if (levelId === 37) return { type: 'combination-all', name: 'Level 37: Combination Challenge' };
    if (levelId === 38) return { type: 'general-practice', name: 'Level 38: Final Challenge' };

    if (levelId >= 39 && levelId <= 50) {
        const mixNum = ((levelId - 39) % 12) + 1;
        return { type: `mastery-mix-${mixNum}` as GameLevel, name: `Level ${levelId}: Mastery Mix` };
    }

    const eliteIndex = ((levelId - 51) % 12) + 1;
    return { type: `mastery-mix-${eliteIndex}` as GameLevel, name: `Level ${levelId}: Elite Mastery` };
};

export default function GamePage() {
    usePageBackground('');
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user, profile, setLastLevelAttended } = useAuth();
    const levelSlug = params.level as string;
    
    const levelInfo = getLevelInfo(levelSlug);
    const levelId = parseInt(levelSlug.replace('level-', ''), 10);

    const [mode, setMode] = useState<'selection' | 'playing'>('selection');
    const [recentOpponents, setRecentOpponents] = useState<{uid: string, name: string, photo: string}[]>([]);
    const [isMatchmaking, setIsMatchmaking] = useState(false);

    useEffect(() => {
        if (user && levelId > 0) {
            setLastLevelAttended(levelId);
            getRecentOpponents(user.uid).then(setRecentOpponents);
        }
    }, [user, levelId, setLastLevelAttended]);

    const handleStartDuel = async (type: 'match' | 'friend') => {
        if (!user || !profile || !levelInfo) return;
        setIsMatchmaking(true);
        try {
            // Curriculumn Duels use the same Bubble Game engine
            const duelId = await startMatchmaking(user.uid, profile, 'standard', levelInfo.name);
            router.push(`/game/duels/${duelId}`);
        } catch (e) {
            toast({ title: "Matchmaking failed", variant: "destructive" });
        } finally {
            setIsMatchmaking(false);
        }
    };

    if (!levelInfo) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invalid Game Level</CardTitle>
                    <CardDescription>The level you selected does not exist.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/game">Back to Levels</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (mode === 'selection') {
        return (
            <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500 mt-6 px-4">
                <div className="text-center space-y-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full font-black uppercase text-xs tracking-widest">Mission Prep</Badge>
                    <h1 className="text-4xl sm:text-6xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none">
                        Choose Your <span className="text-primary italic">Strategy</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Master {levelInfo.name} solo or challenge a peer to a math race.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {/* SOLO MODE */}
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setMode('playing')}>
                        <CardHeader className="p-8 text-center bg-teal-50 rounded-t-[2.5rem] border-b">
                            <div className="mx-auto bg-teal-100 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><User className="w-8 h-8 text-teal-600" /></div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight">Train Alone</CardTitle>
                            <CardDescription className="font-bold">Standard single-player progression.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 text-center">
                            <Button variant="ghost" className="font-black text-teal-600">Start Session <ChevronRight className="ml-1 w-4 h-4"/></Button>
                        </CardContent>
                    </Card>

                    {/* DUEL MODE */}
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => handleStartDuel('match')}>
                        <CardHeader className="p-8 text-center bg-white/5 rounded-t-[2.5rem] border-b border-white/10">
                            <div className="mx-auto bg-primary/20 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Swords className="w-8 h-8 text-primary" /></div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Find Duel</CardTitle>
                            <CardDescription className="text-slate-400 font-bold">Battle anyone online instantly.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 text-center">
                            <Button variant="ghost" className="font-black text-primary">Join Matchmaking <ChevronRight className="ml-1 w-4 h-4"/></Button>
                        </CardContent>
                    </Card>

                    {/* FRIEND MODE */}
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all group overflow-hidden">
                        <CardHeader className="p-8 text-center bg-indigo-50 border-b">
                            <div className="mx-auto bg-indigo-100 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Users className="w-8 h-8 text-indigo-600" /></div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight">Play Friend</CardTitle>
                            <CardDescription className="font-bold">Challenge a teammate.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {recentOpponents.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Recent Rivals</p>
                                    {recentOpponents.map(opp => (
                                        <Button key={opp.uid} variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl" onClick={() => handleStartDuel('friend')}>
                                            <Avatar className="h-6 w-6"><AvatarImage src={opp.photo || undefined}/><AvatarFallback>{opp.name?.[0]}</AvatarFallback></Avatar>
                                            <span className="font-bold text-xs truncate">{opp.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground font-medium italic text-center py-4">No recent rivals found.</p>
                            )}
                            <Button onClick={() => {
                                const link = `${window.location.origin}/game/duels`;
                                navigator.clipboard.writeText(link);
                                toast({ title: "Link Copied!", description: "Invite a friend to the arena." });
                            }} className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                                <Share2 className="w-4 h-4 mr-2" /> Share Invite Link
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return <BubbleGame levelId={levelId} level={levelInfo.type} levelName={levelInfo.name} />
}
