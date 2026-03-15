'use client';

import { useParams } from 'next/navigation';
import { BubbleGame } from '@/components/BubbleGame';
import type { GameLevel } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Refactored dynamic level info resolver for 1,000 levels
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
        const mixNum = levelId - 38;
        return { type: `mastery-mix-${mixNum}` as GameLevel, name: `Level ${levelId}: Mastery Mix ${mixNum}` };
    }

    // Elite levels (51-1000) cycle through advanced mastery mixes
    const eliteIndex = ((levelId - 51) % 12) + 1;
    return { type: `mastery-mix-${eliteIndex}` as GameLevel, name: `Level ${levelId}: Elite Mastery Challenge` };
};

export default function GamePage() {
    usePageBackground('');
    const params = useParams();
    const levelSlug = params.level as string;
    
    const levelInfo = getLevelInfo(levelSlug);
    const levelId = parseInt(levelSlug.replace('level-', ''), 10);

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
