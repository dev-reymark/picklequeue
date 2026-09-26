import React, { useState } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { CourtCard } from './CourtCard';
import { TierComparisonModal } from '@/components/admin/TierComparisonModal';
import { Lock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui';

export const CourtGrid: React.FC = () => {
  const { courts, settings } = usePickleballStore();
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {courts.map((court, index) => {
          const isLocked = settings.tier === 'basic' && index >= 4;

          if (isLocked) {
            return (
              <div
                key={court.id}
                className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[320px] transition-all hover:border-amber-400 dark:hover:border-amber-600"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                    {court.name} (Locked on Basic Plan)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                    The Basic Plan supports up to 4 active courts. Upgrade to Standard to activate unlimited courts and QR code queueing.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsTierModalOpen(true)}
                  endContent={<ArrowUpRight className="w-3.5 h-3.5" />}
                  className="shadow-sm shadow-emerald-600/20"
                >
                  Upgrade to Unlock
                </Button>
              </div>
            );
          }

          return <CourtCard key={court.id} court={court} />;
        })}
      </div>

      <TierComparisonModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
      />
    </>
  );
};
