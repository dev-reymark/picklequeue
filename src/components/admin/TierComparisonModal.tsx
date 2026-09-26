'use client';

import React from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { PlanTier } from '@/types';
import { Modal, Button } from '@/components/ui';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface TierComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TierComparisonModal: React.FC<TierComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, setPlanTier } = usePickleballStore();

  const handleSelectTier = (tier: PlanTier) => {
    setPlanTier(tier);
    onClose();
  };

  const tiers: {
    key: PlanTier;
    label: string;
    icon: typeof Zap;
    colorBadge: string;
    borderActive: string;
    summary: string;
    features: string[];
  }[] = [
    {
      key: 'basic',
      label: 'BASIC',
      icon: Zap,
      colorBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
      summary: 'Perfect for starting operations',
      features: [
        'Digital queue',
        'Player registration',
        'Court management',
        'Admin dashboard',
        'Queue display',
        'Basic reports',
        'Installation & setup',
        'Staff training',
      ],
    },
    {
      key: 'standard',
      label: 'STANDARD',
      icon: Star,
      colorBadge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      borderActive: 'border-sky-500 ring-2 ring-sky-500/20',
      summary: 'Recommended for growing courts',
      features: [
        'Everything in Basic, plus:',
        'QR code queue access',
        'Multiple court management',
        'Player profiles & win/loss stats',
        'Game history & logs',
        'Court utilization reports',
        'Customized queue display',
        'Database backup & restore',
        '30-day post-launch support',
      ],
    },
    {
      key: 'premium',
      label: 'PREMIUM',
      icon: Crown,
      colorBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      borderActive: 'border-purple-500 ring-2 ring-purple-500/20',
      summary: 'Complete solution for larger facilities',
      features: [
        'Everything in Standard, plus:',
        'Cloud-based system & tab sync',
        'Real-time updates across screens',
        'Player notifications & SMS alerts',
        'Advanced analytics & export reports',
        'Executive management dashboard',
        'Custom facility branding & marquee',
        'Online reservation capability',
        'Priority technical support',
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PickleQueue Operational Tiers"
      description="Select an active tier to tailor features for your facility's scale"
      maxWidth="xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const Icon = t.icon;
            const isCurrent = settings.tier === t.key;

            return (
              <div
                key={t.key}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? `${t.borderActive} bg-slate-50/80 dark:bg-zinc-900/90 shadow-md`
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${t.colorBadge}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {t.label.charAt(0) + t.label.slice(1).toLowerCase()} Tier
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {t.summary}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
                    {t.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5">
                  <Button
                    variant={isCurrent ? 'secondary' : 'primary'}
                    size="sm"
                    className="w-full"
                    onClick={() => handleSelectTier(t.key)}
                  >
                    {isCurrent ? 'Current Tier Active' : `Switch to ${t.label}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
          Switching tiers dynamically activates corresponding capabilities across the Admin Console, Player Check-In, and Live Display.
        </div>
      </div>
    </Modal>
  );
};
