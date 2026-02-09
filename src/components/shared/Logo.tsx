'use client';

import React from 'react';

export function Logo() {
  return (
    <div className="relative inline-block text-xl font-bold text-foreground font-headline">
      <span
        className="absolute -top-3 -left-2 text-sm font-semibold text-primary transform -rotate-12"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
      >
        My
      </span>
      <span>Abacus Pro</span>
    </div>
  );
}
