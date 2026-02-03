import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';

interface TelegramLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateLinkCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const BOT_USERNAME = 'naengboo_bot';

export function TelegramLinkDialog({ open, onOpenChange }: TelegramLinkDialogProps) {
  const { user, telegramChatId, refreshProfile } = useAuth();
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLinked = !!telegramChatId;

  // Cleanup polling on unmount or dialog close
  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearInterval(pollRef.current);
      setIsPolling(false);
      setLinkCode(null);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

  const handleGenerateCode = async () => {
    if (!user) return;
    setIsGenerating(true);

    try {
      const code = generateLinkCode();
      const { error } = await supabase
        .from('profiles')
        .update({ telegram_link_code: code })
        .eq('id', user.id);

      if (error) throw error;

      setLinkCode(code);
      toast.success('연동 코드가 생성되었습니다');
      startPolling();
    } catch {
      toast.error('코드 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', user!.id)
        .single();

      if (data?.telegram_chat_id) {
        if (pollRef.current) clearInterval(pollRef.current);
        setIsPolling(false);
        await refreshProfile();
        toast.success('텔레그램 연동이 완료되었습니다!');
        onOpenChange(false);
      }
    }, 2000);

    // Stop after 5 minutes
    setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      setIsPolling(false);
    }, 300000);
  };

  const handleUnlink = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          telegram_chat_id: null,
          telegram_link_code: null,
          telegram_linked_at: null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('텔레그램 연동이 해제되었습니다');
      onOpenChange(false);
    } catch {
      toast.error('연동 해제에 실패했습니다');
    }
  };

  const botLink = linkCode
    ? `https://t.me/${BOT_USERNAME}?start=${linkCode}`
    : `https://t.me/${BOT_USERNAME}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>텔레그램 알림 연동</DialogTitle>
          <DialogDescription>
            {isLinked
              ? '텔레그램 알림이 연동되어 있습니다'
              : '텔레그램으로 유통기한 알림을 받아보세요'}
          </DialogDescription>
        </DialogHeader>

        {isLinked ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm text-green-700">텔레그램 알림이 활성화되어 있습니다</span>
            </div>
            <p className="text-sm text-gray-600">매일 오전 9시에 만료 예정 식품 알림을 받습니다.</p>
            <Button variant="outline" className="w-full" onClick={handleUnlink}>
              연동 해제
            </Button>
          </div>
        ) : !linkCode ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. 아래 버튼으로 연동 코드를 생성합니다</p>
              <p>2. 텔레그램 봇으로 이동하여 코드를 전송합니다</p>
              <p>3. 연동이 완료되면 자동으로 알림이 시작됩니다</p>
            </div>
            <Button className="w-full" onClick={handleGenerateCode} disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />생성 중...</>
              ) : (
                '연동 코드 생성'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-500 mb-2">연동 코드</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-lg font-mono text-center">
                  {linkCode}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(linkCode);
                    toast.success('복사되었습니다');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.open(botLink, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              텔레그램 봇으로 이동
            </Button>

            {isPolling && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
                <span className="text-sm text-blue-700">연동 대기 중... 봇에서 코드를 전송해주세요.</span>
              </div>
            )}

            <Button variant="ghost" className="w-full" onClick={() => setLinkCode(null)}>
              취소
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
