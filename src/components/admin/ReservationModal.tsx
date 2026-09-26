'use client';

import React, { useState } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { Modal, Button } from '@/components/ui';
import { Calendar, Clock, MapPin, User, Phone, Check } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { courts, addReservation } = usePickleballStore();

  const [courtId, setCourtId] = useState(courts[0]?.id || 'c1');
  const [reservedFor, setReservedFor] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [playerNamesInput, setPlayerNamesInput] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservedFor.trim()) return;

    const court = courts.find((c) => c.id === courtId);
    const playerNames = playerNamesInput
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    if (playerNames.length === 0) {
      playerNames.push(reservedFor.trim());
    }

    addReservation({
      courtId,
      courtName: court?.name || 'Court',
      reservedFor: reservedFor.trim(),
      contactPhone: contactPhone.trim() || undefined,
      date,
      startTime,
      endTime,
      playerNames,
      status: 'confirmed',
      notes: notes.trim() || undefined,
    });

    onClose();
    setReservedFor('');
    setContactPhone('');
    setPlayerNamesInput('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Court Reservation"
      description="Book a dedicated court slot for private play, tournaments, or clinics"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Court Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Select Court
          </label>
          <select
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
          >
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name} ({court.status === 'playing' ? 'Currently In Match' : 'Available'})
              </option>
            ))}
          </select>
        </div>

        {/* Customer / Group Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Reservation Title / Customer Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={reservedFor}
            onChange={(e) => setReservedFor(e.target.value)}
            placeholder="e.g. Saturday League Semifinal or Jane Doe"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
          />
        </div>

        {/* Contact Phone & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Contact Phone
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. (555) 000-1234"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Booking Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* Time Slot */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* Player Names */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Player Names (comma separated)
          </label>
          <input
            type="text"
            value={playerNamesInput}
            onChange={(e) => setPlayerNamesInput(e.target.value)}
            placeholder="e.g. Alex, Jordan, Sam, Taylor"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Special Notes / Requests
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Needs tournament balls, reserved for finals"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Confirm Reservation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
