'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BubbleGame } from '@/components/BubbleGame';
import type { GameLevel } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

/**
 * Dynamic Level Engine
 * Maps any level ID (1-1000) to the corresponding curriculum type.
 * CORRECTED: Mapping keys to match src/lib/questions.ts data pools.
 */
const getLevelInfo = (levelSlug: string): { type: GameLevel, name: string } | null => {
    const levelId = parseInt(levelSlug.replace('level-', ''), 10);
    if (isNaN(levelId) || levelId < 1) return null;

    // Levels 1-8: Small Sister Addition & Subtraction
    if (levelId <= 8) {
        const types: GameLevel[] = [
            'basic-addition-plus-4', 'basic-addition-plus-3', 'basic-addition-plus-2', 'basic-addition-plus-1',
            'basic-subtraction-minus-4', 'basic-subtraction-minus-3', 'basic-subtraction-minus-2', 'basic-subtraction-minus-1'
        ];
        return { type: types[levelId - 1], name: `Level ${levelId}: Small Sister` };
    }
    if (levelId === 9) return { type: 'small-sister-all', name: 'Level 9: Small Sister Challenge' };
    
    // Levels 10-27: Big Brother Addition & Subtraction
    if (levelId >= 10 && levelId <= 27) {
        const bigBrotherTypes: GameLevel[] = [
            'big-brother-addition-plus-9', 'big-brother-addition-plus-8', 'big-brother-addition-plus-7', 'big-brother-addition-plus-6', 'big-brother-addition-plus-5',
            'big-brother-addition-plus-4', 'big-brother-addition-plus-3', 'big-brother-addition-plus-2', 'big-brother-addition-plus-1',
            'big-brother-subtraction-minus-9', 'big-brother-subtraction-minus-8', 'big-brother-subtraction-minus-7', 'big-brother-subtraction-minus-6', 'big-brother-subtraction-minus-5',
            'big-brother-subtraction-minus-4', 'big-brother-subtraction-minus-3', 'big-brother-subtraction-minus-2', 'big-brother-subtraction-minus-1'
        ];
        return { type: bigBrotherTypes[levelId - 10], name: `Level ${levelId}: Big Brother` };
    }
    if (levelId === 28) return { type: 'big-brother-all', name: 'Level 28: Big Brother Challenge' };

    // Levels 29-36: Combination Addition & Subtraction
    if (levelId >= 29 && levelId <= 36) {
        const combiTypes: GameLevel[] = [
            'combination-plus-9', 'combination-plus-8', 'combination-plus-7', 'combination-plus-6',
            'combination-minus-9', 'combination-minus-8', 'combination-minus-7', 'combination-minus-6'
        ];
        return { type: combiTypes[levelId - 29], name: `Level ${levelId}: Combination` };
    }
    if (levelId === 37) return { type: 'combination-all', name: 'Level 37: Combination Challenge' };
    if (levelId === 38) return { type: 'general-practice', name: 'Level 38: Final Challenge' };

    // Levels 39-50: Mastery Mix Progression
    if (levelId >= 39 && levelId <= 50) {
        const mixNum = ((levelId - 39) % 12) + 1;
        return { type: `mastery-mix-${mixNum}` as GameLevel, name: `Level ${levelId}: Mastery Mix` };
    }

    // Levels 51-1000: Elite Mastery
    const eliteIndex = ((levelId - 51) % 12) + 1;
    return { type: `mastery-mix-${eliteIndex}` as GameLevel, name: `Level ${levelId}: Elite Mastery` };
};

export default function GamePage() {
    usePageBackground('');
    const params = useParams();
    const router = useRouter();
    const { user, setLastLevelAttended } = useAuth();
    const levelSlug = params.level as string;
    
    const levelInfo = getLevelInfo(levelSlug);
    const levelId = parseInt(levelSlug.replace('level-', ''), 10);

    useEffect(() => {
        if (user && levelId > 0) {
            setLastLevelAttended(levelId);
        }
    }, [user, levelId, setLastLevelAttended]);

    if (!levelInfo) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invalid Game Level</CardTitle>
                    <CardDescription>The level you selected does not exist.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/game')}>
                      Back to Levels
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return <BubbleGame levelId={levelId} level={levelInfo.type} levelName={levelInfo.name} />
}