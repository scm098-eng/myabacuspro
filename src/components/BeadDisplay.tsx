
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
      className="w-12 h-8 sm:w-16 sm:h-10 transition-all duration-300 ease-in-out relative group cursor-pointer shrink-0"
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
  isActive,
}: {
  digit: number;
  isUnitRod: boolean;
  onBeadClick: (value: number) => void;
  isActive?: boolean;
}) => {
  const upperBeadActive = digit >= 5;
  const lowerBeadsValue = digit % 5;
  const rodHeight = 300;

  return (
    <div className={cn(
      "relative w-14 sm:w-20 flex flex-col items-center transition-all duration-200 rounded-lg",
      isActive && "bg-red-500/10 ring-2 ring-red-500 shadow-md scale-105 z-30"
    )} style={{ height: `${rodHeight}px` }}>
      {/* Rod */}
      <div className="absolute h-full w-1 bg-[#4d2b1e] top-0 z-0 rounded-full" />
      
      {/* Separator Bar */}
       <div className="absolute top-[30%] left-[-4px] right-[-4px] h-3 sm:h-4 bg-gradient-to-b from-[#e7c9a8] to-[#d4b48f] -translate-y-1/2 z-10 shadow-lg flex items-center justify-center border-y-2 border-black/50">
         {isUnitRod && <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-black rounded-full shadow-md border border-gray-900"></div>}
      </div>

      {/* Upper Bead Section */}
      <div className="w-full h-[30%] flex flex-col items-center z-20 pb-1 pt-1">
         {upperBeadActive && <div className="flex-grow" />}
         <Bead isUpper={true} onClick={() => onBeadClick(5)} />
         {!upperBeadActive && <div className="flex-grow" />}
      </div>

       {/* Lower Beads Section */}
      <div className="w-full flex-grow flex flex-col items-center z-20 pt-1 pb-1">
            {/* Active lower beads (at the bar) */}
            {Array.from({ length: lowerBeadsValue }).map((_, i) => (
                <Bead key={`active-${i}`} isUpper={false} onClick={() => onBeadClick(i + 1)} />
            ))}
            
            <div className="flex-grow" />
            
            {/* Inactive lower beads (at the bottom) */}
            {Array.from({ length: 4 - lowerBeadsValue }).map((_, i) => (
                <Bead key={`inactive-${i}`} isUpper={false} onClick={() => onBeadClick(lowerBeadsValue + i + 1)} />
            ))}
      </div>
    </div>
  );
};

export default function BeadDisplay({ 
  value, 
  onChange, 
  rodCount = 3,
  activeRodIndex = -1 
}: { 
  value: number, 
  onChange?: (newValue: number) => void,
  rodCount?: number,
  activeRodIndex?: number
}) {
  const getDigits = (num: number) => {
    return num.toString().padStart(rodCount, '0').split('').slice(-rodCount).map(Number);
  };
  
  const digits = getDigits(value);

  const handleBeadClick = (rodIndex: number, beadValue: number) => {
    if (!onChange) return;
    
    const power = (rodCount - 1) - rodIndex;
    const placeValue = Math.pow(10, power);
    const currentDigits = getDigits(value);
    let currentDigitOnRod = currentDigits[rodIndex];
    let newDigitOnRod;

    if (beadValue === 5) {
      newDigitOnRod = currentDigitOnRod >= 5 ? currentDigitOnRod - 5 : currentDigitOnRod + 5;
    } else {
      const currentLowerValue = currentDigitOnRod % 5;
      const isUpperActive = currentDigitOnRod >= 5;

      if (currentLowerValue === 0 && beadValue === 4) {
        newDigitOnRod = isUpperActive ? 9 : 4;
      } else if (currentLowerValue === 4 && beadValue === 1) {
        newDigitOnRod = isUpperActive ? 5 : 0;
      } else {
        if (beadValue > currentLowerValue) {
          newDigitOnRod = (currentDigitOnRod - currentLowerValue) + beadValue;
        } else {
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
    <div className="flex justify-center items-center p-4 rounded-xl border-4 border-[#a16207] shadow-2xl bg-[#c6a47f]" style={{boxShadow: 'inset 0 0 10px #78350f, 0 8px 15px rgba(0,0,0,0.5)'}}>
      <div className="flex flex-row bg-[#a6866a] p-2 rounded-md shadow-inner gap-x-1 sm:gap-x-2">
        {digits.map((digit, index) => (
          <React.Fragment key={index}>
            <AbacusRod 
              digit={digit} 
              isUnitRod={index === rodCount - 1 || (rodCount > 3 && index === Math.floor(rodCount / 2))}
              onBeadClick={(beadValue) => handleBeadClick(index, beadValue)}
              isActive={activeRodIndex === index}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
