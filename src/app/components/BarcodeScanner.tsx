import { useEffect, useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Camera, ImagePlus, Keyboard, Loader2, Focus } from 'lucide-react';

// Type declaration for BarcodeDetector API
interface BarcodeDetectorResult {
  rawValue: string;
  format: string;
  boundingBox: DOMRectReadOnly;
}

declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(source: ImageBitmapSource): Promise<BarcodeDetectorResult[]>;
  static getSupportedFormats(): Promise<string[]>;
}

const BARCODE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'];

function hasBarcodeDetector(): boolean {
  return 'BarcodeDetector' in window;
}

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'photo' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [supported, setSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannedRef = useRef(false);
  const html5ScannerRef = useRef<unknown>(null);
  const html5RunningRef = useRef(false);

  const stopCamera = useCallback(async () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Stop html5-qrcode fallback if running
    if (html5ScannerRef.current && html5RunningRef.current) {
      try {
        await (html5ScannerRef.current as { stop: () => Promise<void> }).stop();
      } catch { /* already stopped */ }
      html5RunningRef.current = false;
    }
    html5ScannerRef.current = null;
  }, []);

  // Live camera mode with native BarcodeDetector
  useEffect(() => {
    if (!open || mode !== 'camera') return;

    let cancelled = false;
    scannedRef.current = false;

    const startNativeScanner = async () => {
      detectorRef.current = new BarcodeDetector({ formats: BARCODE_FORMATS });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (cancelled) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      try {
        const capabilities = track.getCapabilities?.();
        if (capabilities?.focusMode?.includes('continuous')) {
          await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] });
        }
      } catch { /* not supported */ }

      const video = videoRef.current;
      if (!video || cancelled) return;

      video.srcObject = stream;
      await video.play();

      setIsStarting(false);
      setSupported(true);

      const scanFrame = async () => {
        if (cancelled || scannedRef.current || !detectorRef.current || !video) return;
        try {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const results = await detectorRef.current.detect(video);
            if (results.length > 0 && !scannedRef.current) {
              scannedRef.current = true;
              onScan(results[0].rawValue);
              onOpenChange(false);
              return;
            }
          }
        } catch { /* continue */ }
        animFrameRef.current = requestAnimationFrame(scanFrame);
      };

      animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    const startHtml5Fallback = async () => {
      // Wait for DOM
      await new Promise(r => setTimeout(r, 150));
      const el = document.getElementById('html5-fallback-reader');
      if (!el || cancelled) { setIsStarting(false); return; }

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('html5-fallback-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      });
      html5ScannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: (w: number, h: number) => ({
            width: Math.floor(w * 0.9),
            height: Math.floor(h * 0.45),
          }),
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          onScan(decodedText);
          onOpenChange(false);
        },
        () => {}
      );

      html5RunningRef.current = true;
      setIsStarting(false);
      setSupported(false); // marks as fallback mode
    };

    const startCamera = async () => {
      setIsStarting(true);
      setError(null);

      try {
        if (hasBarcodeDetector()) {
          await startNativeScanner();
        } else {
          await startHtml5Fallback();
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Camera error:', err);
          setError('카메라에 접근할 수 없습니다.');
          setIsStarting(false);
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, mode, onScan, onOpenChange, stopCamera]);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      stopCamera();
      setError(null);
      setManualCode('');
      setMode('camera');
      setIsStarting(false);
      setIsScanning(false);
      scannedRef.current = false;
    }
  }, [open, stopCamera]);

  // Photo scan using BarcodeDetector on image
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const bitmap = await createImageBitmap(file);

      if (hasBarcodeDetector()) {
        const detector = new BarcodeDetector({ formats: BARCODE_FORMATS });
        const results = await detector.detect(bitmap);
        if (results.length > 0) {
          onScan(results[0].rawValue);
          onOpenChange(false);
          return;
        }
      }

      // Fallback: try with html5-qrcode if native fails
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('photo-fallback-div', { verbose: false });
        const result = await scanner.scanFileV2(file, true);
        onScan(result.decodedText);
        onOpenChange(false);
        return;
      } catch {
        // Both methods failed
      }

      setError('바코드를 인식할 수 없습니다. 바코드가 선명하게 나오도록 다시 촬영해주세요.');
    } catch {
      setError('이미지를 처리할 수 없습니다.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) {
      onScan(code);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-4">
        <DialogHeader>
          <DialogTitle>바코드 스캔</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-3">
          <Button
            variant={mode === 'camera' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { stopCamera(); setError(null); setMode('camera'); }}
          >
            <Camera className="h-4 w-4 mr-1" />
            실시간
          </Button>
          <Button
            variant={mode === 'photo' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { stopCamera(); setError(null); setMode('photo'); }}
          >
            <ImagePlus className="h-4 w-4 mr-1" />
            사진
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { stopCamera(); setError(null); setMode('manual'); }}
          >
            <Keyboard className="h-4 w-4 mr-1" />
            직접 입력
          </Button>
        </div>

        {mode === 'camera' && (
          <div>
            {isStarting && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-gray-500">카메라 시작 중...</span>
              </div>
            )}
            {/* Native BarcodeDetector mode */}
            <div className="relative rounded-lg overflow-hidden bg-black" style={{ minHeight: isStarting ? 0 : 300, display: supported ? 'block' : 'none' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
                style={{ display: isStarting ? 'none' : 'block' }}
              />
              {/* Scan guide overlay */}
              {!isStarting && !error && supported && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="border-2 border-green-400 rounded-md"
                    style={{
                      width: '85%',
                      height: 80,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      <Focus className="h-3 w-3" />
                      바코드를 여기에 맞추세요
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* html5-qrcode fallback mode */}
            <div
              id="html5-fallback-reader"
              className="w-full rounded-lg overflow-hidden"
              style={{ minHeight: !supported && !isStarting ? 300 : 0, display: !supported ? 'block' : 'none' }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {error && (
              <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
            )}
            {!error && !isStarting && supported && (
              <p className="text-xs text-gray-400 text-center mt-2">
                자동으로 인식됩니다 · 바코드를 또렷하게 비추세요
              </p>
            )}
          </div>
        )}

        {mode === 'photo' && (
          <div className="space-y-3">
            <div id="photo-fallback-div" style={{ display: 'none' }} />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="text-center py-4">
              <Button
                type="button"
                size="lg"
                className="w-full h-20 text-base"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    인식 중...
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6 mr-2" />
                    바코드 촬영하기
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                바코드를 가까이서 선명하게 촬영하세요
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <Input
              placeholder="바코드 번호 입력 (예: 8801234567890)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={!manualCode.trim()}>
              조회
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
