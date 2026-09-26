"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo, ThemeToggle, Button, Badge, Card } from "@/components/ui";
import { useRouter } from "next/navigation";
import { usePickleballStore } from "@/store/pickleball-store";
import { useAuthStore } from "@/store/auth-store";
import { PlanTier } from "@/types";
import {
  Trophy,
  Shield,
  Tv,
  QrCode,
  Users,
  CheckCircle2,
  Play,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  ArrowUpRight,
  Activity,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { settings, setPlanTier } = usePickleballStore();
  const { currentUser, isAuthenticated, isHydrated, logout } = useAuthStore();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual",
  );
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSelectPlan = (tier: PlanTier) => {
    setPlanTier(tier);
    router.push(`/console?plan=${tier}`);
  };

  const faqs = [
    {
      q: "Do players need to download a phone app to join the queue?",
      a: "No app download is required! Players simply scan the venue QR poster with their standard phone camera, enter their name and skill level, and they are immediately queued with real-time turn estimates.",
    },
    {
      q: "How does the Live TV Display work on court monitors?",
      a: "Any smart TV, HDMI stick, tablet, or browser window can open the `/display` link in fullscreen. It automatically syncs in real-time with the admin console across all devices without needing page refreshes.",
    },
    {
      q: "Can we customize game duration, timer buzzers, and rotation styles?",
      a: "Yes! PickleQueue supports multiple rotation modes (Winners Stay, 4-In-4-Out, Round Robin), custom match time limits (e.g. 12 or 15 mins), and audio buzzer notifications when games conclude.",
    },
    {
      q: "What hardware do we need to operate PickleQueue?",
      a: "PickleQueue is 100% web-based. Any laptop, iPad, or tablet at your front desk can operate the queue console. You can connect standard TVs for spectator displays and print our built-in QR poster for player check-ins.",
    },
    {
      q: "Can we track player stats, win streaks, and export leaderboard rankings?",
      a: "Yes, every match outcome feeds directly into the live leaderboard. You can sort by win rate, win streaks, or total matches, and export comprehensive CSV summaries for tournament ceremonies.",
    },
    {
      q: "Is there a limit on how many courts or players we can manage?",
      a: "The Basic plan supports up to 4 active courts, while our Standard and Pro plans allow unlimited courts, unlimited players, and multi-venue capabilities.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-zinc-100 uppercase leading-none">
                PICKLEQUEUE
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mt-1">
                Court &amp; Queue OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-zinc-300">
            <a
              href="#features"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Pricing
            </a>
            <Link
              href="/leaderboard"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Leaderboard
            </Link>
            {isHydrated && isAuthenticated && currentUser?.role === "player" && (
              <Link
                href="/player"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"
              >
                <Activity className="w-3.5 h-3.5" />
                My Stats
              </Link>
            )}
            <a
              href="#faq"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {isHydrated && isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href={currentUser.role === "admin" ? "/console" : "/player"}
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition text-xs font-bold text-slate-800 dark:text-zinc-200"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] px-1 py-0.5 rounded font-mono uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    {currentUser.role}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-rose-600"
                >
                  Sign Out
                </Button>

                <Link
                  href={currentUser.role === "admin" ? "/console" : "/player"}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm shadow-emerald-600/30"
                    endContent={<ArrowUpRight className="w-4 h-4 ml-0.5" />}
                  >
                    {currentUser.role === "admin" ? "Console" : "Player Portal"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link href="/login?mode=signup">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm shadow-emerald-600/30"
                    endContent={<ArrowUpRight className="w-4 h-4 ml-0.5" />}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-zinc-800">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-emerald-500/10 via-amber-500/10 to-sky-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-3 duration-500">
            <span>Digital Pickleball Court Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.12]">
            End Clipboard Chaos.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500">
              Run Effortless Open Play &amp; Rotations.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one digital rotation OS for pickleball courts. Automated
            fair queues, contactless mobile QR check-ins, spectator TV boards,
            and live leaderboard rankings.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/console">
              <Button
                variant="primary"
                size="lg"
                className="text-sm px-6 py-3 shadow-md shadow-emerald-600/30"
                startContent={<Play className="w-4 h-4 fill-white" />}
                endContent={<ArrowUpRight className="w-4 h-4" />}
              >
                Open Console
              </Button>
            </Link>

            <a href="#pricing">
              <Button
                variant="secondary"
                size="lg"
                className="text-sm px-6 py-3"
              >
                View Plans &amp; Pricing
              </Button>
            </a>
          </div>

          <div className="pt-8 border-t border-slate-200/80 dark:border-zinc-800/80 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                100%
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                Automated Rotations
              </div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                &lt; 30s
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                QR Mobile Check-In
              </div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
                0 Apps
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                Required for Players
              </div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 font-mono">
                Real-Time
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                TV &amp; Tablet Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="emerald" size="sm" className="rounded-full">
            Complete Court Operating System
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Engineered Specifically For Pickleball Open Play
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            Every feature is designed to reduce wait friction, eliminate
            arguments over game turns, and provide organizers with complete
            venue control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                Automated Player Queue
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Smart queue rotations with automated wait estimation. Supports
                standard 4-in-4-out, winners-stay, or split partnerships with
                automatic skill tier matching.
              </p>
            </div>
            <ul className="text-xs font-semibold text-slate-600 dark:text-zinc-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Fair
                turn-based queue order
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Skill
                level auto-balancing
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Waiting
                &amp; resting player pool
              </li>
            </ul>
          </Card>

          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                Multi-Court Management
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Monitor occupied, available, and reserved courts at a glance.
                Set match countdown timers, score games in real-time, and
                trigger audio buzzers on game end.
              </p>
            </div>
            <ul className="text-xs font-semibold text-slate-600 dark:text-zinc-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-500 shrink-0" /> Live match
                duration countdowns
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-500 shrink-0" /> 1-Click
                player assignment &amp; rotation
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-500 shrink-0" /> Sound buzzer
                audio alerts
              </li>
            </ul>
          </Card>

          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                Contactless QR Code Access
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Print high-resolution venue signs directly from the app. Players
                scan the poster with their phones to join the queue instantly
                without installing apps or typing passwords.
              </p>
            </div>
            <ul className="text-xs font-semibold text-slate-600 dark:text-zinc-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" /> Built-in
                printable poster generator
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" /> Mobile
                check-in optimized for phones
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" /> Venue
                Wi-Fi &amp; court rules display
              </li>
            </ul>
          </Card>

          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Tv className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                Spectator Live Display
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Project court status on club monitors, smart TVs, or projectors.
                Features high-contrast dark mode, big readable fonts, and ticker
                of upcoming matches.
              </p>
            </div>
            <ul className="text-xs font-semibold text-slate-600 dark:text-zinc-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-500 shrink-0" /> Fullscreen
                TV kiosk view mode
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-500 shrink-0" /> Cross-tab
                zero latency sync
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-500 shrink-0" /> Visible
                from 50+ feet away
              </li>
            </ul>
          </Card>

          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                Live Leaderboard &amp; Podium
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Boost engagement with real-time tournament standings. Highlights
                top champions, win streaks, win rates, and points differential
                with CSV export for prize ceremonies.
              </p>
            </div>
            <ul className="text-xs font-semibold text-slate-600 dark:text-zinc-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-500 shrink-0" /> Animated
                Top 3 Victory Podium
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-500 shrink-0" /> Win streaks
                &amp; win rate tracking
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-500 shrink-0" /> Printable
                and exportable standings
              </li>
            </ul>
          </Card>

          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                Admin Command Suite
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Comprehensive venue control with player roster management, court
                configuration, session archiving, and utilization metrics for
                club managers.
              </p>
            </div>
            <ul className="text-xs font-semibold text-slate-600 dark:text-zinc-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-500 shrink-0" /> Match
                history &amp; session reports
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-500 shrink-0" /> Venue
                settings &amp; custom branding
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-500 shrink-0" /> Instant
                demo data generator
              </li>
            </ul>
          </Card>
        </div>
      </section>

      <section
        id="pricing"
        className="py-16 sm:py-24 bg-slate-100/70 dark:bg-zinc-900/50 border-y border-slate-200 dark:border-zinc-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="amber" size="sm" className="rounded-full">
              Transparent Pricing &bull; No Hidden Fees
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Pick The Plan Tailored To Your Facility
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
              From community parks to multi-court commercial sports centers,
              choose the plan that suits your scale.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <span
                className={`text-xs font-bold ${billingCycle === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() =>
                  setBillingCycle((prev) =>
                    prev === "monthly" ? "annual" : "monthly",
                  )
                }
                className="w-14 h-8 rounded-full bg-slate-300 dark:bg-zinc-800 p-1 flex items-center cursor-pointer transition-colors relative"
                aria-label="Toggle Billing Cycle"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-emerald-600 transition-transform ${
                    billingCycle === "annual"
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold ${billingCycle === "annual" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
                >
                  Annual Billing
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            <Card className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <span>Basic Plan</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                    Starter Operations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Perfect for community parks, casual open play, and starting
                    operations.
                  </p>
                </div>

                <div className="border-y border-slate-100 dark:border-zinc-800/80 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                      {billingCycle === "annual" ? "₱1,199" : "₱1,499"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      / month
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === "annual"
                      ? "Billed annually (₱14,388/yr)"
                      : "Billed monthly"}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">
                    What&apos;s Included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Digital queue management</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Player registration &amp; check-in</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Manage up to 4 active courts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Admin dashboard &amp; queue display</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Basic game reports &amp; match history</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Installation setup &amp; staff guide</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  variant={settings.tier === "basic" ? "primary" : "outline"}
                  size="md"
                  fullWidth
                  onClick={() => handleSelectPlan("basic")}
                >
                  {settings.tier === "basic"
                    ? "Active Plan"
                    : "Launch with Basic"}
                </Button>
              </div>
            </Card>

            <Card className="rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 dark:border-emerald-500 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xl relative scale-100 lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-md flex items-center gap-1.5">
                <span>Most Popular</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span>Standard Plan</span>
                    </div>
                    {settings.tier === "standard" && (
                      <Badge variant="emerald" size="sm">
                        Active Plan
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                    Growing Clubs &amp; Centers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Recommended for dedicated pickleball venues, leagues, and
                    high-traffic clubs.
                  </p>
                </div>

                <div className="border-y border-slate-100 dark:border-zinc-800/80 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                      {billingCycle === "annual" ? "₱2,799" : "₱3,499"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      / month
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === "annual"
                      ? "Billed annually (₱33,588/yr)"
                      : "Billed monthly"}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">
                    Everything in Basic, plus:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                    <li className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-zinc-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Contactless QR Code queue access</span>
                    </li>
                    <li className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-zinc-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Unlimited courts &amp; unlimited players</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Live Spectator TV Kiosk Board</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Player profiles &amp; skill tier balancing</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Leaderboard, podium &amp; win streaks</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Court utilization analytics &amp; CSV export</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Multi-tab real-time sync &amp; backup</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>30-day post-launch dedicated support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  className="shadow-md shadow-emerald-600/30"
                  onClick={() => handleSelectPlan("standard")}
                >
                  {settings.tier === "standard"
                    ? "Active Plan"
                    : "Start with Standard"}
                </Button>
              </div>
            </Card>

            <Card className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      <span>Enterprise</span>
                    </div>
                    {settings.tier === "premium" && (
                      <Badge variant="purple" size="sm">
                        Active Plan
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                    Commercial Facilities
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    For multi-facility operators, tournament directors, and
                    large sports complexes.
                  </p>
                </div>

                <div className="border-y border-slate-100 dark:border-zinc-800/80 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                      {billingCycle === "annual" ? "₱5,999" : "₱7,499"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      / month
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === "annual"
                      ? "Billed annually (₱71,988/yr)"
                      : "Billed monthly"}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">
                    Everything in Standard, plus:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Multi-venue location management</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Custom venue branding &amp; white-labeling</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Tournament brackets &amp; ceremonies</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Hardware TV box provisioning guide</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>99.9% Uptime SLA &amp; 24/7 priority support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  variant={
                    settings.tier === "premium" ? "primary" : "secondary"
                  }
                  size="md"
                  fullWidth
                  onClick={() => handleSelectPlan("premium")}
                >
                  {settings.tier === "premium"
                    ? "Active Plan"
                    : "Launch Enterprise"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <Badge variant="neutral" size="sm">
            The Modern Upgrade
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Why Clubs Are Retiring Whiteboards &amp; Clipboards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
            <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 text-sm uppercase tracking-wider">
              <span>The Old Way (Whiteboard &amp; Clipboard)</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">
                  &times;
                </span>
                <span>
                  Unfair wait times and skipped turns causing arguments.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">
                  &times;
                </span>
                <span>
                  Staff constantly shouting names across noisy courts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">
                  &times;
                </span>
                <span>
                  Players wandering off with zero clue when they play next.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">
                  &times;
                </span>
                <span>
                  Zero records of match wins, court usage, or member history.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-wider">
              <Check className="w-4 h-4" />
              <span>The PickleQueue Advantage</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-zinc-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  100% transparent digital queue displayed on venue TVs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Players scan QR from their phones to check in and see wait
                  estimates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Automated timers, sound buzzers, and balanced match rotations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Real-time leaderboard, win streaks, and exportable tournament
                  data.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <Badge variant="sky" size="sm">
            Got Questions?
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Everything you need to know about setting up and running
            PickleQueue.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <Card
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                    {faq.q}
                  </span>
                  <span className="shrink-0 text-slate-400">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="font-black text-sm tracking-wider uppercase text-slate-900 dark:text-zinc-100">
              PICKLEQUEUE
            </span>
            <span className="text-xs text-slate-400">
              &bull; Digital Court Rotation OS
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            <Link
              href="/console"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Console View
            </Link>
            <Link
              href="/leaderboard"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Leaderboard
            </Link>
            <a
              href="#pricing"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Pricing
            </a>
          </div>

          <div className="text-xs text-slate-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} PickleQueue. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
