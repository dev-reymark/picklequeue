import React from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { CourtCard } from './CourtCard';

export const CourtGrid: React.FC = () => {
  const { courts } = usePickleballStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
      {courts.map((court) => (
        <CourtCard key={court.id} court={court} />
      ))}
    </div>
  );
};
