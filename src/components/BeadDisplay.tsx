
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const Bead = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="w-10 h-6 sm:w-14 sm:h-8 transition-all duration-300 ease-in-out relative group cursor-pointer shrink-0 z-20"
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-b from-[#b95d41] to-[#8c4307]',
          'shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4),_inset_0_2px_3px_rgba(255,255,255,0.3),_0_2px_4px_rgba(0,0,0,0.3)]',
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
  label,
}: {
  digit: number;
  isUnitRod: boolean;
  onBeadClick: (value: number) => void;
  isActive?: boolean;
  label: string;
}) => {
  const upperBeadActive = digit >= 5;
  const lowerBeadsValue = digit % 5;
  const rodHeight = 260; 

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className={cn(
        "relative w-12 sm:w-16 flex flex-col items-center transition-all duration-200 rounded-lg py-2",
        isActive && "bg-red-500/10 ring-2 ring-red-500 shadow-md scale-105 z-30"
      )} style={{ height: `${rodHeight}px` }}>
        
        {/* Rod Wire */}
        <div className="absolute h-full w-1 bg-gradient-to-r from-[#3d241a] to-[#5d342a] left-1/2 -translate-x-1/2 top-0 z-0 rounded-full shadow-inner" />
        
        {/* Separator Bar (Horizontal) */}
         <div className="absolute top-[30%] left-[-4px] right-[-4px] h-3 sm:h-4 bg-gradient-to-b from-[#e7c9a8] to-[#d4b48f] -translate-y-1/2 z-10 shadow-[0_2px_5px_rgba(0,0,0,0.4)] flex items-center justify-center border-y-2 border-black/40">
           {isUnitRod && <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-black rounded-full shadow-inner border border-black ring-1 ring-white/20"></div>}
        </div>

        {/* Upper Section (Heavenly Bead) */}
        <div className="w-full h-[30%] flex flex-col items-center justify-end pb-[6.5px] z-20">
           <div className={cn("transition-all duration-300", !upperBeadActive && "-translate-y-12")}>
              <Bead onClick={() => onBeadClick(5)} />
           </div>
        </div>

         {/* Lower Section (Earthly Beads) */}
        <div className="w-full h-[70%] flex flex-col items-center justify-start pt-[6.5px] z-20">
              <div className="flex flex-col items-center">
                  {Array.from({ length: lowerBeadsValue }).map((_, i) => (
                      <Bead key={`active-${i}`} onClick={() => onBeadClick(i + 1)} />
                  ))}
              </div>
              
              <div className="flex-grow min-h-[12px]" />
              
              <div className="flex flex-col items-center">
                  {Array.from({ length: 4 - lowerBeadsValue }).map((_, i) => (
                      <Bead key={`inactive-${i}`} onClick={() => onBeadClick(lowerBeadsValue + i + 1)} />
                  ))}
              </div>
        </div>
      </div>
      {/* Place Value Indicator */}
      <div className="bg-[#4a2c19] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-sm shadow-sm border border-white/10 uppercase">
        {label}
      </div>
    </div>
  );
};

const ALL_LABELS = ['T.L', 'L', 'T.Th', 'Th', 'H', 'T', 'U'];

export default function BeadDisplay({ 
  value, 
  onChange, 
  rodCount = 7,
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
  
  const digits = getDigits(value || 0);

  // Map labels based on rodCount relative to the unit rod (which is always at the end)
  const currentLabels = ALL_LABELS.slice(ALL_LABELS.length - rodCount);

  const handleBeadClick = (rodIndex: number, beadValue: number) => {
    if (!onChange) return;
    
    const power = (rodCount - 1) - rodIndex;
    const placeValue = Math.pow(10, power);
    const currentDigits = getDigits(value || 0);
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
    const finalValue = (value || 0) - currentValueOnRod + newValueOnRod;
    
    onChange(finalValue);
  };

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20">
      <div className="inline-flex justify-center items-center p-2 sm:p-4 rounded-xl border-[6px] sm:border-[8px] border-[#4a2c19] shadow-xl bg-[#c6a47f] min-w-max mx-auto" 
           style={{boxShadow: 'inset 0 0 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)'}}>
        <div className="flex flex-row bg-[#a6866a] p-1.5 sm:p-2.5 rounded-lg shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)] gap-x-0.5 sm:gap-x-1 border-2 border-[#3d241a]/30">
          {digits.map((digit, index) => (
            <AbacusRod 
              key={index}
              digit={digit} 
              isUnitRod={index === rodCount - 1}
              onBeadClick={(beadValue) => handleBeadClick(index, beadValue)}
              isActive={activeRodIndex === index}
              label={currentLabels[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
