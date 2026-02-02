import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Camera, ImagePlus, Keyboard, Loader2 } from 'lucide-react';

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
];

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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerDivId = 'barcode-reader';

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner && isRunningRef.current) {
      try {
        await scanner.stop();
      } catch {
        // Already stopped
      }
      isRunningRef.current = false;
    }
    scannerRef.current = null;
  }, []);

  // Live camera scanning
  useEffect(() => {
    if (!open || mode !== 'camera') return;

    let cancelled = false;

    const startScanner = async () => {
      setIsStarting(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 150));

      const el = document.getElementById(readerDivId);
      if (!el || cancelled) {
        setIsStarting(false);
        return;
      }

      try {
        const scanner = new Html5Qrcode(readerDivId, {
          formatsToSupport: BARCODE_FORMATS,
          verbose: false,
          useBarCodeDetectorIfSupported: true,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: { exact: 'environment' } },
          {
            fps: 20,
            qrbox: (viewfinderWidth, viewfinderHeight) => ({
              width: Math.floor(viewfinderWidth * 0.9),
              height: Math.floor(viewfinderHeight * 0.5),
            }),
            disableFlip: false,
            videoConstraints: {
              facingMode: { exact: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          (decodedText) => {
            onScan(decodedText);
            onOpenChange(false);
          },
          () => {}
        );

        // Try to enable torch/autofocus if available
        try {
          const track = scanner.getRunningTrackSettings();
          if (track) {
            const capabilities = scanner.getRunningTrackCameraCapabilities();
            if (capabilities?.focusModeFeature()?.isSupported()) {
              capabilities.focusModeFeature().apply('continuous');
            }
          }
        } catch {
          // Not all devices support these features
        }

        isRunningRef.current = true;

        if (cancelled) {
          await stopScanner();
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Camera not available:', err);
          setError('카메라에 접근할 수 없습니다.');
        }
        scannerRef.current = null;
      } finally {
        if (!cancelled) setIsStarting(false);
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open, mode, onScan, onOpenChange, stopScanner]);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      stopScanner();
      setError(null);
      setManualCode('');
      setMode('camera');
      setIsStarting(false);
      setIsScanning(false);
    }
  }, [open, stopScanner]);

  // Photo scan
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const scanner = new Html5Qrcode('photo-scanner-temp', {
        formatsToSupport: BARCODE_FORMATS,
        verbose: false,
        useBarCodeDetectorIfSupported: true,
      });

      const result = await scanner.scanFileV2(file, true);
      onScan(result.decodedText);
      onOpenChange(false);
    } catch {
      setError('바코드를 인식할 수 없습니다. 다시 촬영해주세요.');
    } finally {
      setIsScanning(false);
      // Reset file input
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>바코드 스캔</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-3">
          <Button
            variant={mode === 'camera' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { stopScanner(); setError(null); setMode('camera'); }}
          >
            <Camera className="h-4 w-4 mr-1" />
            실시간
          </Button>
          <Button
            variant={mode === 'photo' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { stopScanner(); setError(null); setMode('photo'); }}
          >
            <ImagePlus className="h-4 w-4 mr-1" />
            사진
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { stopScanner(); setError(null); setMode('manual'); }}
          >
            <Keyboard className="h-4 w-4 mr-1" />
            직접 입력
          </Button>
        </div>

        {mode === 'camera' && (
          <div>
            {isStarting && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-gray-500">카메라 시작 중...</span>
              </div>
            )}
            <div
              id={readerDivId}
              className="w-full rounded-lg overflow-hidden"
              style={{ minHeight: isStarting ? 0 : 280 }}
            />
            {error && (
              <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
            )}
            {!error && !isStarting && (
              <p className="text-xs text-gray-400 text-center mt-2">
                바코드를 스캔 영역 안에 맞추세요
              </p>
            )}
          </div>
        )}

        {mode === 'photo' && (
          <div className="space-y-3">
            {/* Hidden temp div for scanner */}
            <div id="photo-scanner-temp" style={{ display: 'none' }} />

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
                카메라로 바코드를 촬영하면 자동으로 인식합니다
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
