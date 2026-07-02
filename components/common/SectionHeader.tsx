'use client';

import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, description, centered = false, action }: SectionHeaderProps) {
  return (
    <div className={`mb-12 flex flex-col ${centered && !action ? '' : 'md:flex-row md:items-end md:justify-between'} gap-6`}>
      <div className={`${centered ? 'text-center flex flex-col items-center w-full' : 'text-left flex flex-col items-start w-full'}`}>
        {subtitle && (
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3 border border-primary/20">
            {subtitle}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          {title}
        </h2>
        <div className={`h-1 w-16 bg-gradient-to-r from-primary to-primary/40 mt-4 mb-4 rounded-full ${centered ? 'mx-auto' : ''}`} />
        {description && (
          <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 mt-4 md:mt-0">
          {action}
        </div>
      )}
    </div>
  );
}
