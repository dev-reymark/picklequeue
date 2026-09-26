'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';
import { Button, Card, Logo } from '@/components/ui';
import { Shield, Users, Lock, ArrowRight, ArrowLeft, Zap } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isHydrated, quickDemoLogin } = useAuthStore();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-200">
          <Logo className="w-10 h-10 animate-pulse" />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Verifying Session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated at all
  const isNotLoggedIn = !isAuthenticated || !currentUser;
  // Has wrong role
  const isWrongRole = Boolean(requiredRole && currentUser && currentUser.role !== requiredRole);

  if (isNotLoggedIn || isWrongRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const targetRole = requiredRole || 'admin';

    const handleQuickUnlock = () => {
      quickDemoLogin(targetRole);
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-emerald-500 selection:text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-amber-500/10 to-sky-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              {targetRole === 'admin' ? (
                <Shield className="w-7 h-7" />
              ) : (
                <Users className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isWrongRole
                  ? `${targetRole === 'admin' ? 'Admin' : 'Player'} Access Required`
                  : 'Authentication Required'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                {isWrongRole
                  ? `You are currently logged in as a ${currentUser?.role}. You need a ${targetRole} account to view this section.`
                  : `Please sign in with your ${targetRole} credentials to access this portal.`}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}&role=${targetRole}`}
                className="block"
              >
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  className="shadow-md shadow-emerald-600/20"
                  endContent={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In with Credentials
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={handleQuickUnlock}
                className="text-xs font-bold border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                startContent={<Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              >
                1-Click Demo Unlock ({targetRole === 'admin' ? 'Admin' : 'Player'})
              </Button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                  startContent={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Return to Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
