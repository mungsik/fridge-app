import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

function toEmail(username: string): string {
  if (username.includes('@')) return username;
  return `${username}@fridge-app.com`;
}

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signUp, signIn } = useAuth();
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('✖ INPUT REQUIRED — 아이디와 비밀번호를 입력해주세요');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error('✖ MISMATCH — 비밀번호가 일치하지 않습니다');
      return;
    }

    if (password.length < 6) {
      toast.error('✖ TOO SHORT — 비밀번호는 6자 이상');
      return;
    }

    setIsLoading(true);
    const email = toEmail(username);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username);
        if (error) {
          toast.error(`✖ ERROR — ${error.message}`);
        } else {
          toast.success('▶ REGISTERED — 회원가입 완료');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('✖ AUTH FAILED — 아이디 또는 비밀번호 오류');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    ...mono,
    width: '100%',
    background: '#0d1117',
    border: `1px solid ${focusedField === field ? '#58a6ff' : '#30363d'}`,
    color: '#c9d1d9',
    padding: '8px 10px',
    fontSize: 13,
    outline: 'none',
    borderRadius: 0,
    transition: 'border-color 0.15s',
  });

  const labelStyle: React.CSSProperties = {
    ...mono,
    fontSize: 10,
    color: '#6e7681',
    letterSpacing: 1,
    marginBottom: 4,
    display: 'block',
    textTransform: 'uppercase',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0d1117' }}
    >
      <div style={{
        width: 360,
        background: '#161b22',
        border: '1px solid #30363d',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        imageRendering: 'pixelated',
      }}>
        {/* Terminal title bar */}
        <div style={{
          background: '#0d1117',
          padding: '6px 12px',
          borderBottom: '1px solid #30363d',
          textAlign: 'center',
        }}>
          <span style={{
            ...mono, fontSize: 11, fontWeight: 'bold',
            color: '#58a6ff', letterSpacing: 1,
          }}>
            ┌── NAENGBOO AUTH ──┐
          </span>
        </div>

        {/* Boot sequence header */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid #21262d',
          lineHeight: 1.8,
        }}>
          <div style={{ ...mono, fontSize: 10, color: '#6e7681' }}>
            $ ssh fridge@naengboo.app
          </div>
          <div style={{ ...mono, fontSize: 10, color: '#3fb950' }}>
            ✓ connection established
          </div>
          <div style={{ ...mono, fontSize: 10, color: '#d29922' }}>
            {isSignUp ? '? new user detected — register below' : '? authentication required'}
          </div>
        </div>

        {/* Command prompt */}
        <div style={{
          padding: '8px 14px',
          borderBottom: '1px solid #21262d',
        }}>
          <span style={{ ...mono, fontSize: 10, color: '#3fb950' }}>
            guest@fridge:~$
          </span>
          <span style={{ ...mono, fontSize: 10, color: '#c9d1d9', marginLeft: 6 }}>
            {isSignUp ? '/register' : '/login'}
          </span>
          <span style={{
            ...mono, fontSize: 10, color: '#3fb950',
            animation: 'blink 1s step-end infinite',
          }}>
            _
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '14px 14px 10px' }}>
            {/* Username */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>username</label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                placeholder="아이디를 입력하세요"
                style={inputStyle('username')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                placeholder="6자 이상"
                style={inputStyle('password')}
              />
            </div>

            {/* Confirm Password (signup only) */}
            {isSignUp && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  placeholder="비밀번호 재입력"
                  style={inputStyle('confirm')}
                />
              </div>
            )}
          </div>

          {/* Separator */}
          <div style={{ padding: '0 14px' }}>
            <div style={{ borderBottom: '1px dashed #30363d' }} />
          </div>

          {/* Submit button */}
          <div style={{ padding: '12px 14px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...mono,
                width: '100%',
                background: isLoading ? '#161b22' : '#0d1117',
                border: `1px solid ${isLoading ? '#30363d' : '#3fb950'}`,
                color: isLoading ? '#6e7681' : '#3fb950',
                padding: '9px 16px',
                fontSize: 12,
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#0b1a0b';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(63, 185, 80, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isLoading ? '#161b22' : '#0d1117';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  authenticating...
                </>
              ) : (
                isSignUp ? '/register' : '/login'
              )}
            </button>
          </div>
        </form>

        {/* Toggle mode */}
        <div style={{
          background: '#0d1117',
          borderTop: '1px solid #30363d',
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <span style={{ ...mono, fontSize: 10, color: '#6e7681' }}>
            {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setPassword('');
              setConfirmPassword('');
            }}
            style={{
              ...mono,
              background: 'transparent',
              border: 'none',
              color: '#58a6ff',
              fontSize: 10,
              cursor: 'pointer',
              marginLeft: 6,
              textDecoration: 'underline',
            }}
          >
            {isSignUp ? '/login' : '/register'}
          </button>
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
