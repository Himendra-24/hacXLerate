import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, Clock, Sparkles, AlertTriangle } from 'lucide-react';

interface BadgeProps {
  variant?: 'verified' | 'demo' | 'self-reported' | 'pending' | 'success' | 'warning' | 'purple' | 'neutral';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let variantStyles = 'bg-charcoal-800 text-slate-300 border-charcoal-700';

  switch (variant) {
    case 'verified':
      variantStyles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      break;
    case 'demo':
      variantStyles = 'bg-amber-950/50 text-amber-300 border-amber-800/50';
      break;
    case 'self-reported':
      variantStyles = 'bg-slate-800/80 text-slate-400 border-slate-700';
      break;
    case 'pending':
      variantStyles = 'bg-sky-950/60 text-sky-300 border-sky-800/60';
      break;
    case 'warning':
      variantStyles = 'bg-rose-950/60 text-rose-300 border-rose-800/60';
      break;
    case 'success':
      variantStyles = 'bg-teal-950/60 text-teal-300 border-teal-800/60';
      break;
    case 'purple':
      variantStyles = 'bg-electric-950/80 text-electric-300 border-electric-700/60';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${sizeClasses} ${variantStyles} ${className}`}
    >
      {variant === 'verified' && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
      {variant === 'demo' && <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />}
      {variant === 'warning' && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
      {variant === 'purple' && <Sparkles className="w-3 h-3 text-electric-400 shrink-0" />}
      {variant === 'pending' && <Clock className="w-3 h-3 text-sky-400 shrink-0" />}
      {variant === 'success' && <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />}
      {children}
    </span>
  );
};
