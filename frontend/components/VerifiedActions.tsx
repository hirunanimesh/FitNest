import React from 'react';
import { useTrainerData } from '../app/dashboard/trainer/context/TrainerContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface VerifiedActionsProps {
  children: React.ReactElement;
  fallbackMessage?: string;
  showDialog?: boolean;
}

const VerifiedActions: React.FC<VerifiedActionsProps> = ({ 
  children, 
  fallbackMessage = "This action is only available for verified trainers.",
  showDialog = true 
}) => {
  const { trainerData, isLoading } = useTrainerData();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  // Debug logging
  console.log('VerifiedActions Debug:', {
    isLoading,
    trainerData: trainerData ? { verified: trainerData.verified, trainer_name: trainerData.trainer_name } : null,
    showDialog,
    showVerificationDialog
  });

  // Don't render anything while loading
  if (isLoading) {
    console.log('VerifiedActions: Still loading trainer data');
    return null;
  }

  // If trainer is verified, render children normally
  if (trainerData?.verified) {
    console.log('VerifiedActions: Trainer is verified, rendering normal button');
    return children;
  }

  console.log('VerifiedActions: Rendering disabled button and dialog', { 
    showDialog, 
    showVerificationDialog 
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={(e) => {
          console.log('VerifiedActions: Wrapper clicked, opening dialog');
          e.preventDefault();
          e.stopPropagation();
          if (showDialog) {
            setShowVerificationDialog(true);
          }
        }}
        style={{ cursor: 'not-allowed' }}
      >
        {React.cloneElement(children, {
          disabled: true,
          className: `${children.props.className || ''} opacity-50 cursor-not-allowed`,
          title: fallbackMessage,
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
                  <p>{fallbackMessage}</p>
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-300">
                        <p className="font-medium mb-1">To get verified:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Go to your profile page</li>
                          <li>Click "Verify Me" button</li>
                          <li>Submit your verification request</li>
                          <li>Wait for admin approval</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Verified trainers get access to all platform features</span>
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