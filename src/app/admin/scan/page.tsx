
'use client';

import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import { useToast } from '@/hooks/use-toast';
import { checkInUserAction } from '@/app/actions';
import type { User } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraOff, CheckCircle, User as UserIcon, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setScanError('Camera access denied. Please enable camera permissions in your browser settings.');
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              handleScan(code.data);
              setIsScanning(false);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if(hasCameraPermission && isScanning) {
        animationFrameId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isScanning, hasCameraPermission]);

  const handleScan = async (data: string) => {
    setScanResult(data);
    setScanError(null);
    setScannedUser(null);
    try {
      const userData: User = JSON.parse(data);
      if (userData && userData.id) {
        const result = await checkInUserAction(userData.id);
        if (result.success && result.user) {
          setScannedUser(result.user);
           toast({
            title: "Check-in Successful",
            description: `${result.user.name} has been checked in.`,
          });
        } else {
          setScanError(result.message || 'Failed to check-in user.');
        }
      } else {
        setScanError('Invalid QR Code. The scanned code does not contain valid user data.');
      }
    } catch (error) {
      setScanError('Invalid QR Code format. Please scan a valid registration QR code.');
    }
  };
  
  const resetScanner = () => {
    setScanResult(null);
    setScannedUser(null);
    setScanError(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Scan Attendee QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                 {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                       <CameraOff className="w-16 h-16 mb-4" />
                       <h3 className="text-xl font-bold">Camera Access Denied</h3>
                       <p className="text-center">Please enable camera permissions to use the scanner.</p>
                    </div>
                )}
            </div>

            {scannedUser && (
                 <Alert variant="default" className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 !text-green-600"/>
                    <AlertTitle className="text-green-800">Check-in Successful</AlertTitle>
                    <AlertDescription className="text-green-700">
                        <p><span className="font-semibold">{scannedUser.name}</span> has been checked in.</p>
                        <p className="text-sm">Email: {scannedUser.email}</p>
                        <p className="text-sm">Job: {scannedUser.job}</p>
                        {scannedUser.checkedInAt && <p className="text-xs mt-1">Checked in at: {new Date(scannedUser.checkedInAt).toLocaleTimeString()}</p>}
                    </AlertDescription>
                </Alert>
            )}

            {scanError && (
                 <Alert variant="destructive">
                    <XCircle className="h-4 w-4"/>
                    <AlertTitle>Scan Error</AlertTitle>
                    <AlertDescription>
                        {scanError}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={resetScanner} size="lg" disabled={isScanning}>
                    Scan Another
                </Button>
                <Button asChild variant="secondary" size="lg">
                    <Link href="/admin">
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
