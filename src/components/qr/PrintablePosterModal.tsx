"use client";

import React from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { Modal, Button, Logo } from "@/components/ui";
import { Wifi } from "lucide-react";

interface PrintablePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrDataUrl: string;
  joinUrl: string;
}

export const PrintablePosterModal: React.FC<PrintablePosterModalProps> = ({
  isOpen,
  onClose,
  qrDataUrl,
  joinUrl,
}) => {
  const { settings } = usePickleballStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Venue QR Poster Sign"
      description="Print and post at the front desk or court entrance"
      maxWidth="xl"
    >
      <div className="space-y-6">
        <div
          id="printable-venue-sign"
          className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col items-center text-center space-y-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase">
                {settings.venueName || "Pickleball Facility"}
              </h2>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                Digital Queue &amp; Court Rotation System
              </p>
            </div>
          </div>

          <div className="h-0.5 w-full bg-slate-200" />

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              SCAN TO JOIN THE QUEUE
            </h1>
            <p className="text-sm font-medium text-slate-600 max-w-md">
              Point your phone camera at the code below to register and receive
              your live court rotation assignment.
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Scan to join queue"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            ) : null}
          </div>

          <div className="w-full space-y-2 pt-2">
            {(
              [
                {
                  n: 1,
                  title: "Open Camera",
                  desc: "Point your phone camera at the QR code",
                },
                {
                  n: 2,
                  title: "Enter Your Name",
                  desc: "Pick your skill level & match preferences",
                },
                {
                  n: 3,
                  title: "Take the Court",
                  desc: "Watch the TV display or your phone when called",
                },
              ] as { n: number; title: string; desc: string }[]
            ).map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex items-start gap-3 bg-slate-50 px-4 py-3 rounded-xl"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {n}
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-900 text-sm block">
                    {title}
                  </span>
                  <span className="text-slate-500 text-xs">{desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-slate-700" />
              <span className="font-semibold text-slate-700">Guest Wi-Fi:</span>
              <span className="font-mono text-slate-900 font-bold">
                {settings.wifiName || "SmashPoint-Guest"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Password:</span>
              <span className="font-mono text-slate-900 font-bold">
                {settings.wifiPassword || "pickleballhero"}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Powered by PICKLEQUEUE &bull; Real-time Court Management
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            Print This Poster (A4 / 8.5x11)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
