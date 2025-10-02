"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Building, QrCode } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '../context/GymContext';
import { supabase } from '@/lib/supabase';
import { GetUserInfo } from '@/lib/api';
import { GetGymPlans } from '@/api/gym/route';
import { GetUserSubscriptions } from '@/api/user/route';

const TopBar = () => {
  const { user, signOut } = useAuth();
  const { gymId } = useGym();
  const [userInfo, setUserInfo] = useState<{ name: string; avatar?: string } | null>(null);
  const [qrOpen,setQrOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const jsqrRef = useRef<any>(null);
  const zxingRef = useRef<any>(null);
  const zxingActiveRef = useRef<boolean>(false);
  const zxingControlsRef = useRef<any>(null);
  const frameRef = useRef(0);
  const [box,setBox] = useState<{x:number,y:number,w:number,h:number}|null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [debugMsg,setDebugMsg] = useState<string>("");
  const [scanning,setScanning] = useState(false);
  const [scanError,setScanError] = useState<string | null>(null);
  const [decodedValue,setDecodedValue] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<'checking' | 'granted' | 'denied' | null>(null);
  const [matchingPlans, setMatchingPlans] = useState<any[]>([]);

  // Parse QR data and extract customer ID
  const parseQRData = (qrData: string) => {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type === 'gym_entry' && parsed.customer_id) {
        setCustomerId(parsed.customer_id);
        verifyGymAccess(parsed.customer_id);
        return parsed.customer_id;
      }
    } catch (error) {
      // If not JSON, treat as plain text
      console.log('QR data is not JSON, treating as plain text');
    }
    return null;
  };

  // Verify if customer has access to gym
  const verifyGymAccess = async (customerId: string) => {
    try {
      setAccessStatus('checking');
      setDebugMsg('Verifying gym access...');
      
      // Use gymId from context
      if (!gymId) {
        setAccessStatus('denied');
        setDebugMsg('Gym ID not available');
        return;
      }
      
      // Get gym plans using existing API function
      const gymPlansResponse = await GetGymPlans(gymId);
      const gymPlansData = gymPlansResponse.data;
      
      if (!gymPlansData.gymPlan || gymPlansData.gymPlan.length === 0) {
        setAccessStatus('denied');
        setDebugMsg('No gym plans available');
        return;
      }
      
            // Get customer subscriptions
            const subscriptionData = await GetUserSubscriptions(customerId);
            
            if (!subscriptionData || 
                (!subscriptionData.planIds && subscriptionData.length === 0) ||
                (subscriptionData.planIds && subscriptionData.planIds.length === 0)) {
                setAccessStatus('denied');
                setDebugMsg('Customer has no active subscriptions');
                return;
            }
            
            // Find matching plans
            const gymPlanIds = gymPlansData.gymPlan.map((plan: any) => plan.plan_id);
            const customerPlanIds = subscriptionData.planIds || subscriptionData;
            
            // Ensure customerPlanIds is an array
            if (!Array.isArray(customerPlanIds)) {
                setAccessStatus('denied');
                setDebugMsg('Invalid subscription data format');
                return;
            }
      
      const matching = gymPlansData.gymPlan.filter((plan: any) => 
        customerPlanIds.includes(plan.plan_id)
      );
      
      if (matching.length > 0) {
        setAccessStatus('granted');
        setMatchingPlans(matching);
        setDebugMsg(`Access granted! Found ${matching.length} matching plan(s)`);
      } else {
        setAccessStatus('denied');
        setDebugMsg('No matching plans found');
      }
      
    } catch (error) {
      console.error('Error verifying gym access:', error);
      setAccessStatus('denied');
      setDebugMsg('Error verifying access');
    }
  };

  const stopStream = () => {
    // Stop ZXing controls if active
    if (zxingControlsRef.current) {
      try { zxingControlsRef.current.stop(); } catch {}
      zxingControlsRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t=>t.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setScanning(false);
    zxingActiveRef.current = false;
  }

  const closeDialog = () => {
    stopStream();
    setQrOpen(false);
  }

  const tick = useCallback(()=>{
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    if (v.readyState === 4) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      ctx.drawImage(v,0,0,c.width,c.height);
      frameRef.current++;
      // ZXing live processing (preferred)
      // For BrowserMultiFormatReader we allow it to emit result asynchronously. Once result -> stop.
      // jsQR fallback (every 4th frame) in case ZXing fails.
      if (jsqrRef.current && frameRef.current % 4 === 0 && !zxingActiveRef.current) {
        try {
          const imageData = ctx.getImageData(0,0,c.width,c.height);
          const code = jsqrRef.current(imageData.data, imageData.width, imageData.height, { inversionAttempts:'dontInvert' });
          if (code && code.data) {
            console.log('[QR-DECODED-jsQR]', code.data);
            const extractedCustomerId = parseQRData(code.data);
            if (extractedCustomerId) {
              console.log('Extracted Customer ID:', extractedCustomerId);
              setDebugMsg(`Customer ID: ${extractedCustomerId}`);
            } else {
              setDebugMsg('QR detected');
            }
            const loc = code.location;
            if (loc) {
              const minX = Math.min(loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x);
              const maxX = Math.max(loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x);
              const minY = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y);
              const maxY = Math.max(loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y);
              setBox({x:minX,y:minY,w:maxX-minX,h:maxY-minY});
            }
            setDecodedValue(code.data);
            stopStream();
            return;
          }
        } catch {}
      }
      if (startTimeRef.current && Date.now() - startTimeRef.current > 10000 && frameRef.current % 30 === 0) {
        setDebugMsg('Still searching... make sure QR is well lit and in focus');
      }
    }
    animationRef.current = requestAnimationFrame(tick);
  },[])

  const startScan = async () => {
    setScanError(null);
    setBox(null);
    setDebugMsg('Initializing camera');
    setDecodedValue(null);
    setCustomerId(null);
    setAccessStatus(null);
    setMatchingPlans([]);
    try {
      // Preload decoders
      if (!jsqrRef.current) {
        try { const mod = await import('jsqr'); jsqrRef.current = mod.default || (mod as any); } catch {}
      }
      if (!zxingRef.current) {
        try {
          const { BrowserMultiFormatReader } = await import('@zxing/browser');
          zxingRef.current = new BrowserMultiFormatReader();
        } catch(e) {
          console.warn('ZXing load failed', e);
        }
      }
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height:{ ideal:720 } } });
      } catch(e) {
        // fallback to default camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        frameRef.current = 0;
        startTimeRef.current = Date.now();
        setDebugMsg('Scanning...');
        // Start jsQR fallback loop
        tick();
        // Start ZXing continuous decode if available
        if (zxingRef.current && !zxingActiveRef.current && videoRef.current) {
          zxingActiveRef.current = true;
          // Try to pick environment camera deviceId when possible
          let chosenDeviceId: string | null = null;
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const videoDevices = devices.filter(d=>d.kind==='videoinput');
              const back = videoDevices.find(d=>/back|rear|environment/i.test(d.label));
              if (back) chosenDeviceId = back.deviceId; else if (videoDevices[0]) chosenDeviceId = videoDevices[0].deviceId;
            } catch {}
          try {
            zxingControlsRef.current = await zxingRef.current.decodeFromVideoDevice(chosenDeviceId, videoRef.current, (result:any, err:any, controls:any)=>{
              if (result) {
                console.log('[QR-DECODED-ZXING]', result.getText());
                const extractedCustomerId = parseQRData(result.getText());
                if (extractedCustomerId) {
                  console.log('Extracted Customer ID:', extractedCustomerId);
                  setDebugMsg(`Customer ID: ${extractedCustomerId}`);
                } else {
                  setDebugMsg('QR detected');
                }
                setDecodedValue(result.getText());
                stopStream();
              }
              // Ignore not found errors which are normal during scanning
            });
          } catch (e) {
            console.warn('ZXing decode error, fallback to jsQR only', e);
            zxingActiveRef.current = false;
          }
        }
      }
    } catch (e:any) {
      setScanError(e.message || 'Camera access denied');
    }
  }

  useEffect(()=>{return ()=> stopStream();},[])

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) return;

        const data = await GetUserInfo(token);
        const userMeta = data?.user?.user_metadata;
        
        setUserInfo({
          name: userMeta?.full_name || userMeta?.name || user?.email || 'User',
          avatar: userMeta?.avatar_url || userMeta?.picture || undefined
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Fallback to basic user info from auth context
        setUserInfo({
          name: user?.email || 'User',
          avatar: undefined
        });
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div>
      <header className="bg-gray-800">
            <div className="container mx-auto flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building className="h-6 w-6" />
                    </div>
                    <div>
                    <h1 className="text-2xl text-white font-bold">FitNest Gym</h1>
                    <p className="text-sm text-gray-300">Gym Management Dashboard</p>
                    </div>
                </div>
                <div className='flex flex-row gap-5 items-center'>
                <button
                  onClick={()=>{setQrOpen(true); startScan();}}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-indigo-600 text-white transition"
                  title="Scan QR"
                >
                  <QrCode className="h-5 w-5" />
                </button>
                
                <Link href='/dashboard/gym/profile'>
                  <Avatar>
                    <AvatarImage src={userInfo?.avatar || "/placeholder.svg"} alt="User avatar" />
                    <AvatarFallback>{userInfo?.name && userInfo.name.length > 0 ? userInfo.name[0] : "?"}</AvatarFallback>
                  </Avatar>
                </Link>
                  <Button onClick={handleSignOut}>Log out</Button>
                </div>
            </div>
        </header>
        <Dialog open={qrOpen} onOpenChange={(o)=>{ if(!o) closeDialog(); }}>
          <DialogContent className="sm:max-w-[480px] bg-gray-900 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Scan User QR</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full flex justify-center">
                <div className="relative">
                  <video ref={videoRef} className="rounded border border-gray-600 max-h-[320px]" playsInline muted />

                </div>
                {!scanning && !scanError && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Starting camera...</div>
                )}
                {scanError && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">{scanError}</div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="w-full flex flex-col gap-2">
                <p className="text-xs text-gray-400 text-center min-h-[18px]">{debugMsg}</p>
                {decodedValue && (
                  <div className="mt-1 p-3 rounded bg-gray-800 border text-white text-sm">
                    {customerId ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-300">Customer ID: {customerId}</span>
                          {accessStatus === 'checking' && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                          )}
                        </div>
                        
                        {accessStatus === 'granted' && (
                          <div className="border border-green-500 bg-green-900/20 rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="font-bold text-green-400">ACCESS GRANTED</span>
                            </div>
                            <p className="text-green-300 text-xs mb-3">Customer has valid subscription(s) for this gym</p>
                            
                            <div className="space-y-2">
                              <span className="text-green-200 text-xs font-semibold">Active Plans:</span>
                              {matchingPlans.map((plan, index) => (
                                <div key={index} className="bg-green-800/30 rounded p-2 border border-green-600">
                                  <div className="font-medium text-green-100">{plan.title}</div>
                                  <div className="text-xs text-green-300">Price: ${plan.price} • Duration: {plan.duration}</div>
                                  <div className="text-xs text-green-400 mt-1">{plan.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {accessStatus === 'denied' && (
                          <div className="border border-red-500 bg-red-900/20 rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="font-bold text-red-400">ACCESS DENIED</span>
                            </div>
                            <p className="text-red-300 text-xs">Customer does not have valid subscription for this gym</p>
                          </div>
                        )}
                        
                        {accessStatus === 'checking' && (
                          <div className="border border-yellow-500 bg-yellow-900/20 rounded p-3">
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="font-bold text-yellow-400">VERIFYING ACCESS...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold block mb-1 text-gray-300">Decoded QR Value:</span>
                        <div className="break-words whitespace-pre-wrap text-gray-300">{decodedValue}</div>
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                        onClick={()=>{
                          const textToCopy = customerId || decodedValue;
                          textToCopy && navigator.clipboard.writeText(textToCopy);
                        }}
                      >{customerId ? 'Copy Customer ID' : 'Copy'}</Button>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-gray-600 hover:bg-gray-700"
                        onClick={()=>{ stopStream(); startScan(); }}
                      >Scan Another</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4 flex gap-2">
              <Button variant="outline" className="bg-gray-700 hover:bg-gray-600" onClick={()=>{stopStream(); startScan();}}>Restart</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={closeDialog}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}

export default TopBar
