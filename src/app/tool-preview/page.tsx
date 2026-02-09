
'use client';

import BeadDisplay from '@/components/BeadDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Suspense, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';

function ToolPreviewContent() {
  const searchParams = useSearchParams();
  const initialValue = searchParams.get('value');
  const [value, setValue] = useState(123);

  useEffect(() => {
    if (initialValue !== null) {
      const num = parseInt(initialValue, 10);
      if (!isNaN(num) && num >= 0 && num <= 999) {
        setValue(num);
      }
    }
  }, [initialValue]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num >= 0 && num <= 999) {
      setValue(num);
    } else if (e.target.value === '') {
      setValue(0);
    }
  };

  const handleAbacusChange = (newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Abacus Tool Preview</CardTitle>
          <CardDescription>
            Review the abacus tool here. Adjust the value to see how it looks, or click the beads to change the value.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
           <div className="w-full max-w-xs">
             <Label htmlFor="abacus-value">Enter a value (0-999)</Label>
             <Input
                id="abacus-value"
                type="number"
                value={value}
                onChange={handleValueChange}
                min="0"
                max="999"
             />
           </div>
          <BeadDisplay value={value} onChange={handleAbacusChange} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ToolPreviewPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/tool_preview_bg.jpg?alt=media');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolPreviewContent />
    </Suspense>
  );
}
