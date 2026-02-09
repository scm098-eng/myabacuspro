
'use client';

import { useParams } from 'next/navigation';
import { BubbleGame } from '@/components/BubbleGame';
import type { GameLevel } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LEVEL_MAP: Record<string, {type: GameLevel, name: string}> = {
    'level-1': { type: 'small-sister-plus-4', name: 'Level 1: Small Sister (+4)' },
    'level-2': { type: 'small-sister-plus-3', name: 'Level 2: Small Sister (+3)' },
    'level-3': { type: 'small-sister-plus-2', name: 'Level 3: Small Sister (+2)' },
    'level-4': { type: 'small-sister-plus-1', name: 'Level 4: Small Sister (+1)' },
    'level-5': { type: 'small-sister-minus-4', name: 'Level 5: Small Sister (-4)' },
    'level-6': { type: 'small-sister-minus-3', name: 'Level 6: Small Sister (-3)' },
    'level-7': { type: 'small-sister-minus-2', name: 'Level 7: Small Sister (-2)' },
    'level-8': { type: 'small-sister-minus-1', name: 'Level 8: Small Sister (-1)' },
    'level-9': { type: 'small-sister-all', name: 'Level 9: Small Sister Challenge' },
    
    'level-10': { type: 'big-brother-plus-9', name: 'Level 10: Big Brother (+9)'},
    'level-11': { type: 'big-brother-plus-8', name: 'Level 11: Big Brother (+8)'},
    'level-12': { type: 'big-brother-plus-7', name: 'Level 12: Big Brother (+7)'},
    'level-13': { type: 'big-brother-plus-6', name: 'Level 13: Big Brother (+6)'},
    'level-14': { type: 'big-brother-plus-5', name: 'Level 14: Big Brother (+5)'},
    'level-15': { type: 'big-brother-plus-4', name: 'Level 15: Big Brother (+4)'},
    'level-16': { type: 'big-brother-plus-3', name: 'Level 16: Big Brother (+3)'},
    'level-17': { type: 'big-brother-plus-2', name: 'Level 17: Big Brother (+2)'},
    'level-18': { type: 'big-brother-plus-1', name: 'Level 18: Big Brother (+1)'},
    'level-19': { type: 'big-brother-minus-9', name: 'Level 19: Big Brother (-9)'},
    'level-20': { type: 'big-brother-minus-8', name: 'Level 20: Big Brother (-8)'},
    'level-21': { type: 'big-brother-minus-7', name: 'Level 21: Big Brother (-7)'},
    'level-22': { type: 'big-brother-minus-6', name: 'Level 22: Big Brother (-6)'},
    'level-23': { type: 'big-brother-minus-5', name: 'Level 23: Big Brother (-5)'},
    'level-24': { type: 'big-brother-minus-4', name: 'Level 24: Big Brother (-4)'},
    'level-25': { type: 'big-brother-minus-3', name: 'Level 25: Big Brother (-3)'},
    'level-26': { type: 'big-brother-minus-2', name: 'Level 26: Big Brother (-2)'},
    'level-27': { type: 'big-brother-minus-1', name: 'Level 27: Big Brother (-1)'},
    'level-28': { type: 'big-brother-all', name: 'Level 28: Big Brother Challenge'},

    'level-29': { type: 'combination-plus-9', name: 'Level 29: Combination (+9)'},
    'level-30': { type: 'combination-plus-8', name: 'Level 30: Combination (+8)'},
    'level-31': { type: 'combination-plus-7', name: 'Level 31: Combination (+7)'},
    'level-32': { type: 'combination-plus-6', name: 'Level 32: Combination (+6)'},
    'level-33': { type: 'combination-minus-9', name: 'Level 33: Combination (-9)'},
    'level-34': { type: 'combination-minus-8', name: 'Level 34: Combination (-8)'},
    'level-35': { type: 'combination-minus-7', name: 'Level 35: Combination (-7)'},
    'level-36': { type: 'combination-minus-6', name: 'Level 36: Combination (-6)'},
    'level-37': { type: 'combination-all', name: 'Level 37: Combination Challenge'},

    'level-38': { type: 'general-practice', name: 'Level 38: Final Challenge' },

    'level-39': { type: 'mastery-mix-1', name: 'Level 39: Mastery Mix 1'},
    'level-40': { type: 'mastery-mix-2', name: 'Level 40: Mastery Mix 2'},
    'level-41': { type: 'mastery-mix-3', name: 'Level 41: Mastery Mix 3'},
    'level-42': { type: 'mastery-mix-4', name: 'Level 42: Mastery Mix 4' },
    'level-43': { type: 'mastery-mix-5', name: 'Level 43: Mastery Mix 5' },
    'level-44': { type: 'mastery-mix-6', name: 'Level 44: Mastery Mix 6' },
    'level-45': { type: 'mastery-mix-7', name: 'Level 45: Mastery Mix 7' },
    'level-46': { type: 'mastery-mix-8', name: 'Level 46: Mastery Mix 8' },
    'level-47': { type: 'mastery-mix-9', name: 'Level 47: Mastery Mix 9' },
    'level-48': { type: 'mastery-mix-10', name: 'Level 48: Mastery Mix 10' },
    'level-49': { type: 'mastery-mix-11', name: 'Level 49: Mastery Mix 11' },
    'level-50': { type: 'mastery-mix-12', name: 'Level 50: Grandmaster Challenge' },
};

export default function GamePage() {
    usePageBackground('');
    const params = useParams();
    const levelSlug = params.level as string;
    const levelInfo = LEVEL_MAP[levelSlug];
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
