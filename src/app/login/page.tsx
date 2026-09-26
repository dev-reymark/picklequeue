"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import {
  Logo,
  ThemeToggle,
  Button,
  Card,
  Input,
  Select,
} from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { UserRole, SkillLevel } from "@/types";
import {
  Shield,
  Users,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  LogOut,
  QrCode,
  Camera,
  ScanLine,
  Copy,
  CheckCircle2,
  Smartphone,
  ArrowUpRight,
} from "lucide-react";

const skillOptions = [
  {
    value: "beginner",
    label: "Beginner (1.0 - 2.5)",
    description: "Learning fundamentals & rules",
  },
  {
    value: "low-intermediate",
    label: "Low Intermediate (3.0)",
    description: "Consistent rallies & dinking",
  },
  {
    value: "high-intermediate",
    label: "High Intermediate (3.5)",
    description: "Good placement & third shots",
  },
  {
    value: "advanced",
    label: "Advanced (4.0+)",
    description: "Tournament-ready competitive play",
  },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const initialRole = (searchParams.get("role") as UserRole) || "admin";
  const initialMode =
    searchParams.get("mode") === "signup"
      ? "signup"
      : searchParams.get("mode") === "qr"
        ? "qr"
        : "signin";

  const {
    currentUser,
    isAuthenticated,
    isHydrated,
    login,
    signup,
    logout,
    quickDemoLogin,
    loginWithQRToken,
  } = useAuthStore();

  const [mode, setMode] = useState<"signin" | "signup" | "qr">(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [qrSubMode, setQrSubMode] = useState<"phone" | "camera">("phone");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("low-intermediate");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    venueName?: string;
    email?: string;
    password?: string;
    skillLevel?: string;
  }>({});

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrCopied, setQrCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleSelectRole = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage(null);
    setErrors({});
    if (mode === "signin") {
      if (newRole === "admin") {
        setEmail("admin@picklequeue.com");
        setPassword("admin123");
      } else {
        setEmail("player@picklequeue.com");
        setPassword("player123");
      }
    }
  };

  useEffect(() => {
    if (!email) {
      if (initialRole === "player") {
        setEmail("player@picklequeue.com");
        setPassword("player123");
      } else {
        setEmail("admin@picklequeue.com");
        setPassword("admin123");
      }
    }
  }, [initialRole]);

  useEffect(() => {
    const quickAuth = searchParams.get("quickAuth");
    const token = searchParams.get("token") || searchParams.get("userId");
    if (quickAuth || token) {
      const res = loginWithQRToken(token || quickAuth || "player");
      if (res.success && res.user) {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (res.user.role === "admin") {
          router.push("/console");
        } else {
          router.push("/player");
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authUrl = `${window.location.origin}/login?token=${
        role === "admin" ? "user-admin-seed" : "user-player-seed"
      }&quickAuth=${role}`;
      QRCode.toDataURL(authUrl, {
        width: 280,
        margin: 1,
        color: {
          dark: "#09090b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [role]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera is not supported in this browser environment.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraError(
        "Camera permission was declined or device camera is occupied. Use the 1-click test passes below.",
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handlePassScanned = (tokenOrId: string) => {
    stopCamera();
    const res = loginWithQRToken(tokenOrId);
    if (res.success && res.user) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (res.user.role === "admin") {
        router.push("/console");
      } else {
        router.push("/player");
      }
    } else {
      setErrorMessage(res.error || "Failed to authenticate QR pass.");
    }
  };

  const handleCopyQrLink = () => {
    if (typeof window !== "undefined") {
      const authUrl = `${window.location.origin}/login?token=${
        role === "admin" ? "user-admin-seed" : "user-player-seed"
      }&quickAuth=${role}`;
      navigator.clipboard.writeText(authUrl);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrors({});
    setIsSubmitting(true);

    const newErrors: {
      name?: string;
      venueName?: string;
      email?: string;
      password?: string;
      skillLevel?: string;
    } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (mode === "signup" && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (mode === "signup") {
      if (!name.trim()) {
        newErrors.name = "Full name is required.";
      }
      if (role === "admin" && !venueName.trim()) {
        newErrors.venueName = "Venue / Club name is required.";
      }
      if (role === "player" && !skillLevel) {
        newErrors.skillLevel = "Please select your skill level.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "signin") {
        const res = login({ email: trimmedEmail, password, role });
        if (!res.success) {
          setErrorMessage(res.error || "Failed to sign in.");
          setIsSubmitting(false);
          return;
        }

        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (res.user?.role === "admin") {
          router.push("/console");
        } else {
          router.push("/player");
        }
      } else {
        const res = signup({
          email: trimmedEmail,
          password,
          name: name.trim(),
          role,
          venueName: role === "admin" ? venueName.trim() : undefined,
          skillLevel: role === "player" ? skillLevel : undefined,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Failed to create account.");
          setIsSubmitting(false);
          return;
        }

        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (res.user?.role === "admin") {
          router.push("/console");
        } else {
          router.push("/player");
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    setRole(demoRole);
    setMode("signin");
    if (demoRole === "admin") {
      setEmail("admin@picklequeue.com");
      setPassword("admin123");
    } else {
      setEmail("player@picklequeue.com");
      setPassword("player123");
    }
    const user = quickDemoLogin(demoRole);
    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (user.role === "admin") {
      router.push("/console");
    } else {
      router.push("/player");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <header className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-zinc-100 uppercase leading-none">
                PICKLEQUEUE
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mt-1">
                Authentication
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                endContent={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          {isHydrated && isAuthenticated && currentUser && (
            <Card className="p-4 rounded-2xl border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-emerald-600 text-white">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-80">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  startContent={<LogOut className="w-3.5 h-3.5" />}
                >
                  Sign Out
                </Button>
              </div>

              <div className="pt-1 flex items-center gap-2">
                {currentUser.role === "admin" ? (
                  <Link href="/console" className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      endContent={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Go to Admin Console
                    </Button>
                  </Link>
                ) : (
                  <Link href="/player" className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      endContent={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Go to Player Portal
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl space-y-6">
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {mode === "signin"
                  ? "Welcome Back"
                  : mode === "signup"
                    ? "Create Your Account"
                    : "Instant QR Access"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {mode === "signin"
                  ? "Sign in to access your PickleQueue account"
                  : mode === "signup"
                    ? "Get started with digital pickleball queue management"
                    : "Fast contactless authentication via mobile or member pass"}
              </p>
            </div>

            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage(null);
                  setErrors({});
                  stopCamera();
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                  setErrors({});
                  stopCamera();
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("qr");
                  setErrorMessage(null);
                  setErrors({});
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "qr"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Access</span>
              </button>
            </div>

            {mode === "qr" ? (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setQrSubMode("phone");
                      stopCamera();
                    }}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      qrSubMode === "phone"
                        ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Scan with Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQrSubMode("camera");
                      startCamera();
                    }}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      qrSubMode === "camera"
                        ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Member Pass</span>
                  </button>
                </div>

                {qrSubMode === "phone" ? (
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Log in as:
                      </span>
                      <div className="inline-flex rounded-lg bg-slate-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setRole("player")}
                          className={`px-3 py-1 rounded-md transition cursor-pointer ${
                            role === "player"
                              ? "bg-emerald-600 text-white"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
                          }`}
                        >
                          Player
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole("admin")}
                          className={`px-3 py-1 rounded-md transition cursor-pointer ${
                            role === "admin"
                              ? "bg-emerald-600 text-white"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <div className="inline-block p-3 rounded-2xl bg-white dark:bg-white border-2 border-emerald-500/30 shadow-md">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="QR Code Sign In"
                          className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                          Generating QR...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Scan with phone camera to authenticate</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() =>
                          handlePassScanned(
                            role === "admin"
                              ? "user-admin-seed"
                              : "user-player-seed",
                          )
                        }
                        className="shadow-md shadow-emerald-600/20"
                      >
                        Simulate Mobile QR Scan
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={handleCopyQrLink}
                        className="text-xs"
                        startContent={
                          qrCopied ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {qrCopied
                          ? "Magic URL Copied to Clipboard!"
                          : "Copy Magic Sign-In URL"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${
                          cameraActive ? "block" : "hidden"
                        }`}
                      />

                      {!cameraActive && (
                        <div className="text-center p-4 space-y-2">
                          <ScanLine className="w-8 h-8 text-emerald-500 mx-auto animate-pulse" />
                          <p className="text-xs text-zinc-400">
                            Position physical member pass QR card in front of
                            camera
                          </p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={startCamera}
                            className="text-xs mt-1"
                            startContent={<Camera className="w-3.5 h-3.5" />}
                          >
                            Turn On Camera
                          </Button>
                        </div>
                      )}

                      {cameraActive && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                          <div className="w-40 h-40 border-2 border-emerald-500/80 rounded-2xl relative">
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-bounce" />
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest mt-2 bg-black/60 px-2 py-0.5 rounded">
                            Scanning for QR pass...
                          </span>
                        </div>
                      )}
                    </div>

                    {cameraError && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
                        {cameraError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">
                        Instant 1-Click Member Passes
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePassScanned("user-player-seed")}
                          className="text-xs border-emerald-500/30 hover:border-emerald-500 text-left"
                          startContent={
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                          }
                        >
                          Alex Rivera (Player)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePassScanned("user-admin-seed")}
                          className="text-xs border-amber-500/30 hover:border-amber-500 text-left"
                          startContent={
                            <Shield className="w-3.5 h-3.5 text-amber-500" />
                          }
                        >
                          Coach Marcus (Admin)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSelectRole("admin")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        role === "admin"
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Shield
                          className={`w-4 h-4 ${role === "admin" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}
                        />
                        {role === "admin" && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <span className="text-xs font-black">Venue Admin</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                        Courts &amp; queuing operations
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRole("player")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        role === "player"
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Users
                          className={`w-4 h-4 ${role === "player" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}
                        />
                        {role === "player" && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <span className="text-xs font-black">Player</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                        Turns, stats &amp; streaks
                      </span>
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {mode === "signup" && (
                    <Input
                      label="Full Name"
                      placeholder="e.g. Alex Rivera"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name)
                          setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      error={errors.name}
                      required
                    />
                  )}

                  {mode === "signup" && role === "admin" && (
                    <Input
                      label="Venue / Club Name"
                      placeholder="e.g. Metro Pickleball Arena"
                      value={venueName}
                      onChange={(e) => {
                        setVenueName(e.target.value);
                        if (errors.venueName)
                          setErrors((prev) => ({
                            ...prev,
                            venueName: undefined,
                          }));
                      }}
                      error={errors.venueName}
                      required
                    />
                  )}

                  {mode === "signup" && role === "player" && (
                    <Select
                      label="Self-Assessed Skill Level"
                      value={skillLevel}
                      onValueChange={(val) => {
                        setSkillLevel(val as SkillLevel);
                        if (errors.skillLevel)
                          setErrors((prev) => ({
                            ...prev,
                            skillLevel: undefined,
                          }));
                      }}
                      options={skillOptions}
                      error={errors.skillLevel}
                    />
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@picklequeue.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    error={errors.email}
                    required
                  />

                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    error={errors.password}
                    required
                    endAdornment={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-0.5 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={isSubmitting}
                    className="mt-2 shadow-md shadow-emerald-600/20"
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    {mode === "signin"
                      ? `Sign In as ${role === "admin" ? "Admin" : "Player"}`
                      : `Create ${role === "admin" ? "Admin" : "Player"} Account`}
                  </Button>
                </form>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">
                    Fast Testing Demo Access
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDemo("admin")}
                      className="text-xs"
                      startContent={
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                      }
                    >
                      Demo Admin
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDemo("player")}
                      className="text-xs"
                      startContent={
                        <Users className="w-3.5 h-3.5 text-sky-500" />
                      }
                    >
                      Demo Player
                    </Button>
                  </div>
                </div>

                {role === "player" && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 text-center space-y-1">
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      Just dropping in for a casual session without password?
                    </p>
                    <Link
                      href="/join"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Continue with Instant Guest QR Check-In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
