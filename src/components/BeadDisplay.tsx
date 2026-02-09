
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const Bead = ({
  isUpper,
  onClick,
}: {
  isUpper: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="w-16 h-10 transition-transform duration-300 ease-in-out relative group cursor-pointer"
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-b from-[#b95d41] to-[#8c4307]',
          'shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4),_inset_0_2px_3px_rgba(255,255,255,0.3)]',
          'border-2 border-[#78350f]'
        )}
      />
    </div>
  );
};

const AbacusRod = ({
  digit,
  isUnitRod,
  onBeadClick,
}: {
  digit: number;
  isUnitRod: boolean;
  onBeadClick: (value: number) => void;
}) => {
  const upperBeadActive = digit >= 5;
  const lowerBeadsValue = digit % 5;
  const rodHeight = 280;

  return (
    <div className="relative w-20 flex flex-col items-center" style={{ height: `${rodHeight}px` }}>
      {/* Rod */}
      <div className="absolute h-full w-1.5 bg-[#4d2b1e] top-0 z-0 rounded-full" />
      
      {/* Separator Bar */}
       <div className="absolute top-[29%] left-[-8px] right-[-8px] h-4 bg-gradient-to-b from-[#e7c9a8] to-[#d4b48f] -translate-y-1/2 z-10 shadow-lg flex items-center justify-center border-y-2 border-black/50">
         {isUnitRod && <div className="h-2 w-2 bg-white rounded-full shadow-md border border-gray-400"></div>}
      </div>

      {/* Upper Bead Section */}
      <div className="w-full h-[29%] flex flex-col items-center justify-start z-20">
         <div className={cn("transition-transform duration-300 ease-in-out", upperBeadActive ? 'translate-y-8' : 'translate-y-0')}>
            <Bead isUpper={true} onClick={() => onBeadClick(5)} />
         </div>
      </div>

       {/* Lower Beads Section */}
      <div className="w-full flex-grow flex flex-col items-center justify-end z-20">
            {[...Array(4)].map((_, i) => {
              // i is 0 for top bead, 3 for bottom bead
              const beadIsActive = (i + 1) <= lowerBeadsValue;
              
              return (
                 <div key={i} className={cn("transition-transform duration-300 ease-in-out", beadIsActive ? '-translate-y-8' : 'translate-y-0')}>
                    <Bead isUpper={false} onClick={() => onBeadClick(i + 1)} />
                 </div>
              )
            })}
      </div>
    </div>
  );
};

export default function BeadDisplay({ value, onChange }: { value: number, onChange?: (newValue: number) => void }) {
  const getDigits = (num: number) => num.toString().padStart(3, '0').split('').map(Number);
  const digits = getDigits(value);

  const handleBeadClick = (rodIndex: number, beadValue: number) => {
    if (!onChange) return;
    
    const power = 2 - rodIndex;
    const placeValue = Math.pow(10, power);
    const currentDigits = getDigits(value);
    let currentDigitOnRod = currentDigits[rodIndex];
    let newDigitOnRod;

    if (beadValue === 5) { // Upper bead clicked
      if (currentDigitOnRod >= 5) { // Deactivate upper bead
        newDigitOnRod = currentDigitOnRod - 5;
      } else { // Activate upper bead
        newDigitOnRod = currentDigitOnRod + 5;
      }
    } else { // Lower bead clicked (beadValue is 1, 2, 3, or 4)
      const currentLowerValue = currentDigitOnRod % 5;
      const isUpperActive = currentDigitOnRod >= 5;

      // Group move logic
      if (currentLowerValue === 0 && beadValue === 4) { // all inactive, click bottom one
        newDigitOnRod = isUpperActive ? 9 : 4;
      } else if (currentLowerValue === 4 && beadValue === 1) { // all active, click top one
        newDigitOnRod = isUpperActive ? 5 : 0;
      } else {
        // Sequential move logic (top-down)
        if (beadValue > currentLowerValue) {
          // Activating this bead and all above it
          newDigitOnRod = (currentDigitOnRod - currentLowerValue) + beadValue;
        } else {
          // Deactivating this bead and all below it
          newDigitOnRod = (currentDigitOnRod - currentLowerValue) + (beadValue - 1);
        }
      }
    }
    
    const currentValueOnRod = currentDigitOnRod * placeValue;
    const newValueOnRod = newDigitOnRod * placeValue;
    const finalValue = value - currentValueOnRod + newValueOnRod;
    
    onChange(finalValue);
  };

  return (
    <div className="flex justify-center items-center p-4 rounded-lg border-4 border-[#a16207] shadow-2xl bg-[#c6a47f]" style={{boxShadow: 'inset 0 0 10px #78350f, 0 8px 15px rgba(0,0,0,0.5)'}}>
      <div className="flex flex-row bg-[#a6866a] p-2 rounded-md shadow-inner gap-x-2">
        {digits.map((digit, index) => (
          <React.Fragment key={index}>
            <AbacusRod 
              digit={digit} 
              isUnitRod={index === 2} // 0 is hundreds, 1 is tens, 2 is units
              onBeadClick={(beadValue) => handleBeadClick(index, beadValue)}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
