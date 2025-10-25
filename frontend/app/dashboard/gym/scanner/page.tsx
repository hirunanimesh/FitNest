"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, QrCode, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGym } from "../context/GymContext";
import { GetGymPlans } from "@/api/gym/route";
import { GetUserSubscriptions } from "@/api/user/route";

export default function GymScannerPage() {
  const router = useRouter();
  const { gymId } = useGym();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const jsqrRef = useRef<any>(null);
  const zxingRef = useRef<any>(null);
  const zxingControlsRef = useRef<any>(null);
  const zxingActiveRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);
  const pauseTimerRef = useRef<number | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState<string>("");

  const [lastScan, setLastScan] = useState<{
    raw: string;
    customerId?: string | null;
    status: "granted" | "denied" | "checking";
    matchingPlans: any[];
    at: number;
  } | null>(null);
  const lastValueRef = useRef<string | null>(null);
  const lastScanAtRef = useRef<number>(0);

  const stopStream = () => {
    try {
      // clear any pending pause timers and resume flags
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      pausedRef.current = false;
      if (zxingControlsRef.current) {
        try {
          zxingControlsRef.current.stop();
        } catch {}
        zxingControlsRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          (videoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach((t) => t.stop());
        } finally {
          videoRef.current.srcObject = null;
        }
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } finally {
      setScanning(false);
      zxingActiveRef.current = false;
    }
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  // Stop stream when page is hidden or unloading; resume on visible if still on page
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stopStream();
      } else {
        // Avoid auto starting if already scanning
        if (!scanning) startScan();
      }
    };
    const onPageHide = () => stopStream();
    const onBeforeUnload = () => stopStream();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [scanning]);

  const parseQRData = (qrData: string) => {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type === "gym_entry" && parsed.customer_id) {
        return String(parsed.customer_id);
      }
    } catch {}
    return null;
  };

  const verifyGymAccess = async (customerId: string) => {
    try {
      setLastScan((prev) =>
        prev ? { ...prev, status: "checking", matchingPlans: [] } : prev
      );
      setDebugMsg("Verifying gym access...");

      if (!gymId) {
        setLastScan((prev) =>
          prev ? { ...prev, status: "denied" } : prev
        );
        setDebugMsg("Gym ID not available");
        return;
      }

      const gymPlansResponse = await GetGymPlans(gymId);
      const gymPlansData = gymPlansResponse.data;
      if (!gymPlansData.gymPlan || gymPlansData.gymPlan.length === 0) {
        setLastScan((prev) =>
          prev ? { ...prev, status: "denied" } : prev
        );
        setDebugMsg("No gym plans available");
        return;
      }

      const subscriptionData = await GetUserSubscriptions(customerId);
      if (
        !subscriptionData ||
        (!subscriptionData.planIds && subscriptionData.length === 0) ||
        (subscriptionData.planIds && subscriptionData.planIds.length === 0)
      ) {
        setLastScan((prev) =>
          prev ? { ...prev, status: "denied" } : prev
        );
        setDebugMsg("Customer has no active subscriptions");
        return;
      }

      const gymPlanIds = gymPlansData.gymPlan.map((p: any) => p.plan_id);
      const customerPlanIds = subscriptionData.planIds || subscriptionData;
      if (!Array.isArray(customerPlanIds)) {
        setLastScan((prev) =>
          prev ? { ...prev, status: "denied" } : prev
        );
        setDebugMsg("Invalid subscription data format");
        return;
      }

      const matching = gymPlansData.gymPlan.filter((p: any) =>
        customerPlanIds.includes(p.plan_id)
      );
      if (matching.length > 0) {
        setLastScan((prev) =>
          prev
            ? { ...prev, status: "granted", matchingPlans: matching }
            : prev
        );
        setDebugMsg(`Access granted! Found ${matching.length} matching plan(s)`);
      } else {
        setLastScan((prev) => (prev ? { ...prev, status: "denied" } : prev));
        setDebugMsg("No matching plans found");
      }
    } catch (e) {
      setLastScan((prev) => (prev ? { ...prev, status: "denied" } : prev));
      setDebugMsg("Error verifying access");
    }
  };

  const handleDecoded = (text: string) => {
    // ignore decoded results if we are currently pausing between scans
    if (pausedRef.current) return;
    const now = Date.now();
    // Throttle duplicates within 1.5s
    if (text === lastValueRef.current && now - lastScanAtRef.current < 1500) {
      return;
    }
    lastValueRef.current = text;
    lastScanAtRef.current = now;

    const customerId = parseQRData(text);
    setLastScan({ raw: text, customerId, status: "checking", matchingPlans: [], at: now });
    if (customerId) {
      verifyGymAccess(customerId);
    } else {
      // Not a recognized JSON payload; mark as denied but keep scanning
      setLastScan({ raw: text, customerId: null, status: "denied", matchingPlans: [], at: now });
    }
  };

  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    if (v.readyState === 4) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      if (jsqrRef.current) {
        // If paused, skip decoding work to save CPU
        if (pausedRef.current) {
          animationRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const imageData = ctx.getImageData(0, 0, c.width, c.height);
          const code = jsqrRef.current(
            imageData.data,
            imageData.width,
            imageData.height,
            { inversionAttempts: "dontInvert" }
          );
          if (code && code.data) {
            handleDecoded(code.data);
          }
        } catch {}
      }
    }
    animationRef.current = requestAnimationFrame(tick);
  }, []);

  const startScan = async () => {
    setScanError(null);
    setDebugMsg("Initializing camera");
    try {
      // Load decoders
      if (!jsqrRef.current) {
        try {
          const mod = await import("jsqr");
          jsqrRef.current = (mod as any).default || (mod as any);
        } catch {}
      }
      if (!zxingRef.current) {
        try {
          const { BrowserMultiFormatReader } = await import("@zxing/browser");
          zxingRef.current = new BrowserMultiFormatReader();
        } catch {}
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        setDebugMsg("Scanning...");

        // Start jsQR loop
        tick();

        // Start continuous ZXing if available
        if (zxingRef.current && !zxingActiveRef.current && videoRef.current) {
          zxingActiveRef.current = true;
          let chosenDeviceId: string | null = null;
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((d) => d.kind === "videoinput");
            const back = videoDevices.find((d) => /back|rear|environment/i.test(d.label));
            if (back) chosenDeviceId = back.deviceId;
            else if (videoDevices[0]) chosenDeviceId = videoDevices[0].deviceId;
          } catch {}
          try {
            zxingControlsRef.current = await zxingRef.current.decodeFromVideoDevice(
              chosenDeviceId,
              videoRef.current,
              (result: any) => {
                if (result) {
                  if (pausedRef.current) return;
                  const text = result.getText();
                  handleDecoded(text);
                }
              }
            );
          } catch {
            zxingActiveRef.current = false;
          }
        }
      }
    } catch (e: any) {
      setScanError(e.message || "Camera access denied");
    }
  };

  useEffect(() => {
    startScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When a result is finalized (granted/denied), pause scanning for 4s then resume
  useEffect(() => {
    if (!lastScan) return;
    if ((lastScan.status === "granted" || lastScan.status === "denied") && !pausedRef.current) {
      pausedRef.current = true;
      setDebugMsg(
        lastScan.status === "granted"
          ? "Access granted — pausing 4s before next scan"
          : "Access denied — pausing 4s before next scan"
      );
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      pauseTimerRef.current = window.setTimeout(() => {
        pausedRef.current = false;
        // Clear last scan panel and allow the same QR to be scanned again
        setLastScan(null);
        lastValueRef.current = null;
        lastScanAtRef.current = 0;
        setDebugMsg("Scanning...");
      }, 4000) as unknown as number;
    }
  }, [lastScan?.status]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="outline" className="bg-white text-black border-gray-200 hover:bg-white/90" onClick={() => { stopStream(); router.back(); }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-400" />
            <h1 className="text-lg font-semibold">QR Scanner</h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" className="bg-white text-black border-gray-200 hover:bg-white/90" onClick={() => { stopStream(); startScan(); }}>Restart</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="relative rounded-xl border border-gray-800 overflow-hidden">
            <div className="aspect-[4/3] bg-black/40 flex items-center justify-center">
              <video ref={videoRef} className="max-h-[70vh] object-contain" playsInline muted />
              {!scanning && !scanError && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Starting camera...</div>
              )}
              {scanError && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">{scanError}</div>
              )}
              {/* overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-indigo-500/80 rounded-lg shadow-[0_0_40px_rgba(99,102,241,0.35)]" />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="px-4 py-3 border-t border-gray-800 text-sm text-gray-400">{debugMsg}</div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-800 p-4 bg-gray-900/50">
              <h2 className="text-base font-semibold mb-2">Instructions</h2>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>Align the QR code within the square frame.</li>
                <li>Ensure good lighting and steady hands.</li>
                <li>Scanning continues automatically—no need to tap.</li>
              </ul>
            </div>

            {lastScan && (
              <div className="rounded-xl border border-gray-800 p-4 bg-gray-900/50">
                <div className="flex items-center gap-2 mb-3">
                  {lastScan.status === "granted" ? (
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                  ) : lastScan.status === "denied" ? (
                    <ShieldX className="h-5 w-5 text-red-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                  )}
                  <h2 className="text-base font-semibold">Last scan</h2>
                  <span className="ml-auto text-xs text-gray-400">{new Date(lastScan.at).toLocaleTimeString()}</span>
                </div>

                {lastScan.customerId && (
                  <div className="text-sm text-gray-300 mb-2">Customer ID: <span className="text-gray-100 font-mono">{lastScan.customerId}</span></div>
                )}
                {!lastScan.customerId && (
                  <div className="text-sm text-gray-300 mb-2">Unrecognized QR payload</div>
                )}

                {lastScan.status === "granted" && (
                  <div className="space-y-2">
                    <div className="text-green-300 text-sm font-medium">ACCESS GRANTED</div>
                    <div className="space-y-2">
                      {lastScan.matchingPlans.map((p, idx) => (
                        <div key={idx} className="bg-green-900/20 border border-green-700 rounded p-2">
                          <div className="text-green-100 font-medium">{p.title}</div>
                          <div className="text-green-300 text-xs">${'{'}p.price{'}'} • {p.duration}</div>
                          <div className="text-green-400 text-xs mt-1">{p.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lastScan.status === "denied" && (
                  <div className="text-red-300 text-sm font-medium">ACCESS DENIED: No valid subscription for this gym</div>
                )}

                {lastScan.status === "checking" && (
                  <div className="text-yellow-300 text-sm font-medium">VERIFYING ACCESS...</div>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => {
                      const textToCopy = lastScan.customerId || lastScan.raw;
                      textToCopy && navigator.clipboard.writeText(textToCopy);
                    }}
                  >
                    {lastScan.customerId ? "Copy Customer ID" : "Copy Raw"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
