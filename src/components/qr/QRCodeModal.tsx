"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { usePickleballStore } from "@/store/pickleball-store";
import { useAuthStore } from "@/store/auth-store";
import { Modal, Button } from "@/components/ui";
import { PrintablePosterModal } from "./PrintablePosterModal";
import {
  QrCode,
  Copy,
  Check,
  Wifi,
  Smartphone,
  ArrowUpRight,
  Shield,
  Printer,
} from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, setPlanTier } = usePickleballStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [customOrigin, setCustomOrigin] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [wifiName, setWifiName] = useState(settings.wifiName || "");
  const [wifiPassword, setWifiPassword] = useState(settings.wifiPassword || "");

  useEffect(() => {
    setWifiName(settings.wifiName || "");
    setWifiPassword(settings.wifiPassword || "");
  }, [settings.wifiName, settings.wifiPassword]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setCustomOrigin(origin);
      generateQR(`${origin}/join`);
    }
  }, [isOpen]);

  const generateQR = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

  const handleOriginChange = (newOrigin: string) => {
    setCustomOrigin(newOrigin);
    generateQR(`${newOrigin}/join`);
  };

  const joinUrl = `${customOrigin}/join`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isAdmin ? "Venue QR Code & Check-in Signage" : "Player QR Code Access"}
        description={
          isAdmin
            ? "Configure venue QR posters, Wi-Fi info, and self-service queue access"
            : "Scan with your phone to instantly join the queue without an app"
        }
        maxWidth="lg"
      >
        {settings.tier === "basic" ? (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto">
              <QrCode className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                {isAdmin
                  ? "QR Code Check-In Requires Standard Plan"
                  : "Self-Service QR Check-In Unavailable"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {isAdmin
                  ? "Contactless QR poster check-ins, mobile self-service entry, and printable venue signs are available on the Standard and Enterprise plans. In the Basic Plan, court staff register players manually from the console."
                  : "Self-service QR check-in is currently not enabled for this facility. Please approach court staff at the front desk to check in."}
              </p>
            </div>
            <div className="pt-3 flex items-center justify-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  className="shadow-sm shadow-emerald-600/30"
                  onClick={() => {
                    setPlanTier("standard");
                  }}
                >
                  Upgrade to Standard (₱3,499/mo)
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-inner">
              <div className="relative bg-white p-4 rounded-2xl shadow-md border border-slate-200/80 dark:border-zinc-700">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scan to join PickleQueue"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                    <span className="text-xs text-slate-400">
                      Generating QR...
                    </span>
                  </div>
                )}

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow flex items-center gap-1.5 whitespace-nowrap">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Scan with Camera</span>
                </div>
              </div>

              <div className="mt-6 text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {settings.venueName || "Venue"} Digital Check-in
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                  No app installation required. Players scan, submit name &amp;
                  skill level, and are placed into the queue.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Player Check-in URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 text-xs font-mono bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl truncate text-slate-700 dark:text-zinc-300 select-all">
                  {joinUrl}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  startContent={
                    copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              {isAdmin && (
                <>
                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
                    <span>
                      Local phone testing? Replace localhost with your Wi-Fi IP
                      (e.g. 192.168.x.x)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customOrigin}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-600 dark:text-zinc-400 focus:outline-emerald-500"
                    placeholder="http://192.168.1.100:3000"
                  />
                </>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Wi-Fi Details (shown on poster)
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Shield className="w-3 h-3" />
                    Admin Only
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Network Name
                    </label>
                    <input
                      type="text"
                      value={wifiName}
                      onChange={(e) => {
                        setWifiName(e.target.value);
                        updateSettings({ wifiName: e.target.value });
                      }}
                      placeholder="e.g. SmashPoint-Guest"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => {
                        setWifiPassword(e.target.value);
                        updateSettings({ wifiPassword: e.target.value });
                      }}
                      placeholder="e.g. pickleballhero"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {isAdmin && (
                <Button
                  variant="primary"
                  className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => setIsPosterOpen(true)}
                  startContent={<Printer className="w-4 h-4" />}
                >
                  Print Venue Signage Poster
                </Button>
              )}
              <a
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                  isAdmin
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                    : "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Open Player View</span>
              </a>
            </div>
          </div>
        )}
      </Modal>

      <PrintablePosterModal
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
        qrDataUrl={qrDataUrl}
        joinUrl={joinUrl}
      />
    </>
  );
};
