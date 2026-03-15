
'use client';

import { useParams } from 'next/navigation';
import { BubbleGame } from '@/components/BubbleGame';
import type { GameLevel } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Helper to determine GameLevel string based on level ID for 1000 levels
const getLevelType = (id: number): { type: GameLevel, name: string } | null => {
    if (id < 1) return null;

    if (id <= 8) {
        const types: GameLevel[] = [
            'small-sister-plus-4', 'small-sister-plus-3', 'small-sister-plus-2', 'small-sister-plus-1',
            'small-sister-minus-4', 'small-sister-minus-3', 'small-sister-minus-2', 'small-sister-minus-1'
        ];
        return { type: types[id - 1], name: `Level ${id}: Small Sister` };
    }
    if (id === 9) return { type: 'small-sister-all', name: 'Level 9: Small Sister Challenge' };
    
    if (id >= 10 && id <= 27) {
        const bigBrotherTypes: GameLevel[] = [
            'big-brother-plus-9', 'big-brother-plus-8', 'big-brother-plus-7', 'big-brother-plus-6', 'big-brother-plus-5',
            'big-brother-plus-4', 'big-brother-plus-3', 'big-brother-plus-2', 'big-brother-plus-1',
            'big-brother-minus-9', 'big-brother-minus-8', 'big-brother-minus-7', 'big-brother-minus-6', 'big-brother-minus-5',
            'big-brother-minus-4', 'big-brother-minus-3', 'big-brother-minus-2', 'big-brother-minus-1'
        ];
        return { type: bigBrotherTypes[id - 10], name: `Level ${id}: Big Brother` };
    }
    if (id === 28) return { type: 'big-brother-all', name: 'Level 28: Big Brother Challenge' };

    if (id >= 29 && id <= 36) {
        const combiTypes: GameLevel[] = [
            'combination-plus-9', 'combination-plus-8', 'combination-plus-7', 'combination-plus-6',
            'combination-minus-9', 'combination-minus-8', 'combination-minus-7', 'combination-minus-6'
        ];
        return { type: combiTypes[id - 29], name: `Level ${id}: Combination` };
    }
    if (id === 37) return { type: 'combination-all', name: 'Level 37: Combination Challenge' };
    if (id === 38) return { type: 'general-practice', name: 'Level 38: Final Challenge' };

    if (id >= 39 && id <= 50) {
        const mixNum = id - 38;
        return { type: `mastery-mix-${mixNum}` as GameLevel, name: `Level ${id}: Mastery Mix ${mixNum}` };
    }

    // Elite levels (51-1000)
    const eliteIndex = ((id - 51) % 12) + 1;
    return { type: `mastery-mix-${eliteIndex}` as GameLevel, name: `Level ${id}: Elite Mastery Challenge` };
};

export default function GamePage() {
    usePageBackground('');
    const params = useParams();
    const levelSlug = params.level as string;
    const levelId = parseInt(levelSlug.replace('level-', ''), 10);

    const levelInfo = getLevelType(levelId);

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

    return <BubbleGame levelId={levelId} level={levelInfo.type} levelName={levelInfo.name} />
}
