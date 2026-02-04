import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, Copy, ExternalLink, X, Unlink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

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
      toast.success('▶ CODE GENERATED — 연동 코드 생성됨');
      startPolling();
    } catch {
      toast.error('✖ GENERATE FAILED — 코드 생성 실패');
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
        toast.success('▶ LINKED — 텔레그램 연동 완료!');
        onOpenChange(false);
      }
    }, 2000);

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
      toast.success('▶ UNLINKED — 텔레그램 연동 해제됨');
      onOpenChange(false);
    } catch {
      toast.error('✖ UNLINK FAILED — 연동 해제 실패');
    }
  };

  const botLink = linkCode
    ? `https://t.me/${BOT_USERNAME}?start=${linkCode}`
    : `https://t.me/${BOT_USERNAME}`;

  if (!open) return null;

  const btnStyle: React.CSSProperties = {
    ...mono,
    width: '100%',
    background: '#0d1117',
    border: '1px solid #30363d',
    color: '#c9d1d9',
    padding: '8px 14px',
    fontSize: 11,
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.15s',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 340,
          background: '#161b22',
          border: '1px solid #30363d',
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Title bar */}
        <div style={{
          background: '#0d1117',
          padding: '6px 12px',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            ...mono, fontSize: 11, fontWeight: 'bold',
            color: '#58a6ff', letterSpacing: 1,
          }}>
            ┌── TELEGRAM ──┐
          </span>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6e7681',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Command prompt */}
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid #21262d',
        }}>
          <span style={{ ...mono, fontSize: 10, color: '#3fb950' }}>
            user@fridge:~$
          </span>
          <span style={{ ...mono, fontSize: 10, color: '#c9d1d9', marginLeft: 6 }}>
            /telegram {isLinked ? '--status' : '--link'}
          </span>
          <span style={{
            ...mono, fontSize: 10, color: '#3fb950',
            animation: 'blink 1s step-end infinite',
          }}>
            _
          </span>
        </div>

        <div style={{ padding: 12 }}>
          {isLinked ? (
            <>
              {/* Linked status */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', marginBottom: 10,
                background: '#0d1117', border: '1px solid #3fb950',
              }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: '#3fb950', flexShrink: 0 }} />
                <span style={{ ...mono, fontSize: 11, fontWeight: 'bold', color: '#3fb950' }}>
                  STATUS: LINKED
                </span>
              </div>

              <div style={{ ...mono, fontSize: 10, color: '#6e7681', marginBottom: 12, lineHeight: 1.8 }}>
                <div>매일 오전 9시에 만료 예정 식품 알림을 받습니다.</div>
              </div>

              <button
                style={{ ...btnStyle, borderColor: '#f85149', color: '#f85149' }}
                onClick={handleUnlink}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1a0e0e';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(248, 81, 73, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0d1117';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Unlink style={{ width: 12, height: 12 }} />
                /unlink
              </button>
            </>
          ) : !linkCode ? (
            <>
              {/* Instructions */}
              <div style={{ ...mono, fontSize: 10, color: '#c9d1d9', marginBottom: 12, lineHeight: 2 }}>
                <div><span style={{ color: '#58a6ff' }}>1.</span> 연동 코드 생성</div>
                <div><span style={{ color: '#58a6ff' }}>2.</span> 텔레그램 봇에서 코드 전송</div>
                <div><span style={{ color: '#58a6ff' }}>3.</span> 자동 연동 완료</div>
              </div>

              <button
                style={{ ...btnStyle, borderColor: '#3fb950', color: '#3fb950' }}
                onClick={handleGenerateCode}
                disabled={isGenerating}
                onMouseEnter={(e) => {
                  if (!isGenerating) {
                    e.currentTarget.style.background = '#0b1a0b';
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(63, 185, 80, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0d1117';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
                    generating...
                  </>
                ) : (
                  '/generate-code'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Code display */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 9, color: '#6e7681', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>
                  link code
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{
                    flex: 1,
                    background: '#0d1117',
                    border: '1px solid #58a6ff',
                    padding: '8px 12px',
                    textAlign: 'center',
                  }}>
                    <span style={{ ...mono, fontSize: 18, fontWeight: 'bold', color: '#58a6ff', letterSpacing: 4 }}>
                      {linkCode}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(linkCode);
                      toast.success('▶ COPIED — 클립보드에 복사됨');
                    }}
                    style={{
                      background: '#0d1117',
                      border: '1px solid #30363d',
                      color: '#6e7681',
                      padding: 8,
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    <Copy style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>

              {/* Open bot button */}
              <button
                style={{ ...btnStyle, borderColor: '#58a6ff', color: '#58a6ff', marginBottom: 8 }}
                onClick={() => window.open(botLink, '_blank')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0d1a2d';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(88, 166, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0d1117';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ExternalLink style={{ width: 12, height: 12 }} />
                /open-bot
              </button>

              {/* Polling status */}
              {isPolling && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', marginBottom: 8,
                  background: '#0d1117', border: '1px solid #d29922',
                }}>
                  <Loader2 style={{ width: 14, height: 14, color: '#d29922', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  <span style={{ ...mono, fontSize: 10, color: '#d29922' }}>
                    waiting for bot response...
                  </span>
                </div>
              )}

              {/* Cancel */}
              <button
                style={btnStyle}
                onClick={() => setLinkCode(null)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f85149';
                  e.currentTarget.style.color = '#f85149';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#30363d';
                  e.currentTarget.style.color = '#c9d1d9';
                }}
              >
                /cancel
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#0d1117',
          borderTop: '1px solid #30363d',
          padding: '4px 12px',
          textAlign: 'center',
        }}>
          <span style={{ ...mono, fontSize: 9, color: '#30363d', letterSpacing: 2 }}>
            {'─'.repeat(20)}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
