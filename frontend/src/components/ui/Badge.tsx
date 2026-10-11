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

  let variantStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (variant) {
    case 'verified':
      variantStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
      break;
    case 'demo':
      variantStyles = 'bg-amber-50 text-amber-700 border-amber-200/90';
      break;
    case 'self-reported':
      variantStyles = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'pending':
      variantStyles = 'bg-sky-50 text-sky-700 border-sky-200/90';
      break;
    case 'warning':
      variantStyles = 'bg-rose-50 text-rose-700 border-rose-200/90';
      break;
    case 'success':
      variantStyles = 'bg-teal-50 text-teal-700 border-teal-200/90';
      break;
    case 'purple':
      variantStyles = 'bg-violet-50 text-[#5B46F6] border-violet-200/90';
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
