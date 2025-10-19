"use client";
import React from 'react';
import { useTrainerData } from '../app/dashboard/trainer/context/TrainerContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GetGymProfileData } from '@/lib/api';

interface VerifiedActionsProps {
  children: React.ReactElement;
  role?: 'trainer' | 'gym';
  // When using for gyms (or to override), pass explicit verification/loading state
  isVerified?: boolean;
  loadingOverride?: boolean;
  fallbackMessage?: string;
  showDialog?: boolean;
}

// Simple in-memory cache to avoid repeated gym verification fetches across mounts
// Cached for a short TTL to balance freshness and performance
let gymVerificationCache: { userId: string | null; verified: boolean; ts: number } | null = null;
const GYM_VERIFY_TTL_MS = 5 * 60 * 1000; // 5 minutes

const VerifiedActions: React.FC<VerifiedActionsProps> = ({
  children,
  role = 'trainer',
  isVerified,
  loadingOverride,
  fallbackMessage,
  showDialog = true,
}) => {
  // Try to access trainer context when available (keeps backward compatibility for trainer usage)
  let trainerCtx: { trainerData: any; isLoading: boolean } | null = null;
  try {
    // This will throw if not wrapped in TrainerDataProvider; we catch and treat as null
    trainerCtx = useTrainerData();
  } catch (e) {
    trainerCtx = null;
  }

  const ctxLoading = trainerCtx?.isLoading ?? false;
  const ctxVerified = trainerCtx?.trainerData?.verified ?? false;

  const normalizedRole: 'trainer' | 'gym' = role ?? 'trainer';
  const entityLabel = normalizedRole === 'gym' ? 'gym' : 'trainer';
  const defaultMessage = `This action is only available for verified ${entityLabel}s.`;

  // Internal gym verification state (only used when role === 'gym' and props not provided)
  const [gymLoading, setGymLoading] = useState<boolean>(normalizedRole === 'gym');
  const [gymVerified, setGymVerified] = useState<boolean>(false);

  // Fetch gym verification via API (mirrors trainer context usage pattern)
  useEffect(() => {
    let cancelled = false;
    const fetchGymVerification = async () => {
      if (normalizedRole !== 'gym') return;
      // If caller provided overrides, skip fetching
      if (typeof isVerified === 'boolean' || typeof loadingOverride === 'boolean') return;
      try {
        setGymLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const userId = data.session?.user?.id;
        if (!userId) {
          if (!cancelled) setGymVerified(false);
          return;
        }

        // Use cache if available and fresh
        const now = Date.now();
        if (
          gymVerificationCache &&
          gymVerificationCache.userId === userId &&
          now - gymVerificationCache.ts < GYM_VERIFY_TTL_MS
        ) {
          if (!cancelled) {
            setGymVerified(Boolean(gymVerificationCache.verified));
            setGymLoading(false);
          }
          return;
        }

        const resp = await GetGymProfileData(userId);
        const verified = Boolean(resp?.gym?.verified);
        // update cache
        gymVerificationCache = { userId, verified, ts: Date.now() };
        if (!cancelled) setGymVerified(verified);
      } catch (err) {
        if (!cancelled) setGymVerified(false);
      } finally {
        if (!cancelled) setGymLoading(false);
      }
    };
    fetchGymVerification();
    return () => {
      cancelled = true;
    };
  // It's intentional to exclude isVerified/loadingOverride from deps; if those change, caller controls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedRole]);

  const effectiveIsLoading =
    // Caller override takes precedence
    typeof loadingOverride === 'boolean'
      ? loadingOverride
      : normalizedRole === 'trainer'
        ? ctxLoading
        : gymLoading;

  const effectiveIsVerified =
    // Caller override takes precedence
    typeof isVerified === 'boolean'
      ? isVerified
      : normalizedRole === 'trainer'
        ? ctxVerified
        : gymVerified;

  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  // Debug logging
  console.log('VerifiedActions Debug:', {
    role: normalizedRole,
    isLoading: effectiveIsLoading,
    fromContext: trainerCtx ? 'trainer-context' : 'no-context',
    verified: effectiveIsVerified,
    showDialog,
    showVerificationDialog,
  });

  // If entity is verified, render children normally
  if (effectiveIsVerified) {
    console.log('VerifiedActions: Entity is verified, rendering normal button');
    return children;
  }

  // When loading or not verified, render the children immediately but disabled to avoid UI flicker.
  // This prevents late-appearing buttons while the verification check resolves.
  console.log('VerifiedActions: Rendering disabled button and dialog', {
    showDialog,
    showVerificationDialog,
    loading: effectiveIsLoading,
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={(e) => {
          console.log('VerifiedActions: Wrapper clicked, opening dialog');
          e.preventDefault();
          e.stopPropagation();
          // If still loading, ignore clicks; once resolved, interaction will be enabled if verified
          if (effectiveIsLoading) return;
          if (showDialog) {
            setShowVerificationDialog(true);
          }
        }}
        style={{ cursor: 'not-allowed' }}
      >
        {React.cloneElement(children, {
          disabled: true,
          className: `${children.props.className || ''} opacity-50 cursor-not-allowed`,
          title: fallbackMessage ?? defaultMessage,
          style: { pointerEvents: 'none' }
        })}
      </div>
      
      {showDialog && (
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="bg-gray-800 text-white border border-gray-700 max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Shield className="h-6 w-6 text-yellow-400" />
                </div>
                <DialogTitle className="text-lg font-semibold text-white">
                  Verification Required
                </DialogTitle>
              </div>
              <DialogDescription asChild>
                <div className="text-gray-300 space-y-3">
                  <p>{fallbackMessage ?? defaultMessage}</p>
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-300">
                        <p className="font-medium mb-1">To get verified:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Go to your {entityLabel === 'gym' ? 'gym profile' : 'profile'} page</li>
                          <li>Click {entityLabel === 'gym' ? '"Verify Gym"' : '"Verify Me"'} button</li>
                          <li>Submit your verification request</li>
                          <li>Wait for admin approval</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Verified {entityLabel}s get access to all platform features</span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => setShowVerificationDialog(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VerifiedActions;