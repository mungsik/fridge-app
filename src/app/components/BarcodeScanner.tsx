import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Camera, Keyboard, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const readerDivId = 'barcode-reader';

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner && isRunningRef.current) {
      try {
        await scanner.stop();
      } catch {
        // Already stopped or never started
      }
      isRunningRef.current = false;
    }
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || mode !== 'camera') return;

    let cancelled = false;

    const startScanner = async () => {
      setIsStarting(true);
      setError(null);

      // Wait for DOM element to be ready
      await new Promise(resolve => setTimeout(resolve, 150));

      const el = document.getElementById(readerDivId);
      if (!el || cancelled) {
        setIsStarting(false);
        return;
      }

      try {
        const scanner = new Html5Qrcode(readerDivId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          (decodedText) => {
            onScan(decodedText);
            onOpenChange(false);
          },
          () => {
            // Ignore scan failures (happens every frame without a barcode)
          }
        );

        isRunningRef.current = true;

        if (cancelled) {
          await stopScanner();
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Camera not available:', err);
          setError('카메라에 접근할 수 없습니다. 수동 입력을 사용하세요.');
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
    }
  }, [open, stopScanner]);

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
        <div className="flex gap-2 mb-3">
          <Button
            variant={mode === 'camera' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setMode('camera')}
          >
            <Camera className="h-4 w-4 mr-1" />
            카메라
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { stopScanner(); setMode('manual'); }}
          >
            <Keyboard className="h-4 w-4 mr-1" />
            직접 입력
          </Button>
        </div>

        {mode === 'camera' ? (
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
              style={{ minHeight: isStarting ? 0 : 250 }}
            />
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
            {!error && !isStarting && (
              <p className="text-xs text-gray-400 text-center mt-2">
                바코드를 카메라에 비추세요
              </p>
            )}
          </div>
        ) : (
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
