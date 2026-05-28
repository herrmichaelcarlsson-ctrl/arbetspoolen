'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OnboardingGuideProps {
  userRole: 'job_seeker' | 'employer';
  completedSteps?: string[];
}

const SEEKER_STEPS = [
  { id: 'avatar', label: 'Ladda upp profilbild', icon: '📷', href: '/seeker/dashboard' },
  { id: 'trade', label: 'Välj ditt yrke', icon: '🔧', href: '/seeker/dashboard' },
  { id: 'bio', label: 'Skriv en kort presentation', icon: '✍️', href: '/seeker/dashboard' },
  { id: 'cv', label: 'Ladda upp ditt CV', icon: '📄', href: '/seeker/dashboard' },
  { id: 'certificates', label: 'Lägg till certifikat', icon: '🎓', href: '/seeker/dashboard' },
];

const EMPLOYER_STEPS = [
  { id: 'company', label: 'Fyll i företagsinfo', icon: '🏢', href: '/employer/profile' },
  { id: 'logo', label: 'Ladda upp företagslogga', icon: '🖼️', href: '/employer/profile' },
  { id: 'description', label: 'Skriv en presentation', icon: '📝', href: '/employer/profile' },
  { id: 'saved', label: 'Spara intressanta kandidater', icon: '❤️', href: '/employer/directory' },
  { id: 'premium', label: 'Uppgradera till Premium', icon: '⭐', href: '/employer/directory' },
];

export function OnboardingGuide({ userRole, completedSteps = [] }: OnboardingGuideProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const steps = userRole === 'employer' ? EMPLOYER_STEPS : SEEKER_STEPS;
  const completedCount = steps.filter(s => completedSteps.includes(s.id)).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-6 left-6 bg-[var(--brand)] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-[var(--brand-hover)] transition-colors z-40"
      >
        <span className="text-lg">📋</span>
        <span className="font-medium text-sm">Kom igång</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{completedCount}/{steps.length}</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden z-40">
      <div className="bg-gradient-to-r from-[var(--brand)] to-[var(--brand-hover)] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">🚀 Kom igång</h3>
          <p className="text-white/80 text-xs mt-0.5">{completedCount} av {steps.length} klart</p>
        </div>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="text-white/80 hover:text-white p-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <div className="w-full h-2 bg-[var(--surface)] rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="space-y-2">
          {steps.map(step => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCompleted 
                    ? 'bg-emerald-50 border border-emerald-200' 
                    : 'bg-[var(--surface)] border border-transparent hover:border-[var(--border)]'
                }`}
              >
                <span className="text-xl">{step.icon}</span>
                <span className={`flex-1 text-sm font-medium ${
                  isCompleted ? 'text-emerald-700' : 'text-[var(--brand-navy)]'
                }`}>
                  {step.label}
                </span>
                {isCompleted ? (
                  <span className="text-emerald-500">✓</span>
                ) : (
                  <span className="text-[var(--muted)]">→</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
