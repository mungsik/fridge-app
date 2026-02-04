import { useState, useEffect, useRef } from 'react';
import { FridgeItem } from '@/app/types/fridge';
import { FRIDGE_ZONES } from '@/app/components/fridge-view/fridgeConstants';
import { Loader2, X, ChevronDown } from 'lucide-react';

interface FridgeItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: Omit<FridgeItem, 'id' | 'createdAt'>) => void;
  initialData?: FridgeItem;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

const CATEGORIES = [
  { value: '', label: '미지정' },
  { value: '과일', label: '과일' },
  { value: '야채', label: '야채' },
  { value: '채소', label: '채소' },
  { value: '음료', label: '음료' },
  { value: '우유', label: '우유' },
  { value: '개인반찬', label: '개인반찬' },
  { value: '셀러드', label: '셀러드' },
  { value: '빵', label: '빵' },
  { value: '아이스크림', label: '아이스크림' },
  { value: '기타', label: '기타' },
];

const LOCATIONS = [
  { value: '', label: '미지정' },
  ...FRIDGE_ZONES.map(z => ({ value: z.id, label: z.label })),
];

export function FridgeItemForm({ open, onOpenChange, onSubmit, initialData, mode, isSubmitting = false }: FridgeItemFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '1');
  const [expiryDate, setExpiryDate] = useState(
    initialData?.expiryDate || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState(initialData?.category || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setQuantity(initialData.quantity.toString());
      setExpiryDate(initialData.expiryDate);
      setCategory(initialData.category);
      setLocation(initialData.location);
    } else {
      setName('');
      setQuantity('1');
      setExpiryDate(new Date().toISOString().split('T')[0]);
      setCategory('');
      setLocation('');
    }
  }, [initialData]);

  useEffect(() => {
    if (open && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      quantity: parseInt(quantity) || 1,
      expiryDate,
      category,
      location,
    });

    if (!isSubmitting) {
      setName('');
      setQuantity('1');
      setExpiryDate(new Date().toISOString().split('T')[0]);
      setCategory('');
      setLocation('');
      onOpenChange(false);
    }
  };

  if (!open) return null;

  const inputStyle = (field: string): React.CSSProperties => ({
    ...mono,
    width: '100%',
    background: '#0d1117',
    border: `1px solid ${focusedField === field ? '#58a6ff' : '#30363d'}`,
    color: '#c9d1d9',
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
    borderRadius: 0,
    transition: 'border-color 0.15s',
  });

  const selectStyle = (field: string): React.CSSProperties => ({
    ...inputStyle(field),
    appearance: 'none' as const,
    cursor: 'pointer',
    paddingRight: 28,
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

  const requiredDot: React.CSSProperties = {
    display: 'inline-block',
    width: 4,
    height: 4,
    background: '#f85149',
    marginLeft: 4,
    verticalAlign: 'middle',
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
          width: 440,
          background: '#161b22',
          border: '1px solid #30363d',
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Terminal title bar */}
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
            {mode === 'create' ? '┌── NEW ITEM ──┐' : '┌── EDIT ITEM ──┐'}
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

        {/* Command prompt header */}
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid #21262d',
        }}>
          <span style={{ ...mono, fontSize: 10, color: '#3fb950' }}>
            user@fridge:~$
          </span>
          <span style={{ ...mono, fontSize: 10, color: '#c9d1d9', marginLeft: 6 }}>
            {mode === 'create' ? 'add --item' : `edit --id ${initialData?.name || ''}`}
          </span>
          <span style={{
            ...mono, fontSize: 10, color: '#3fb950',
            animation: 'blink 1s step-end infinite',
          }}>
            _
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '12px 12px 8px' }}>
            {/* Name field */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>
                name <span style={requiredDot} />
              </label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                disabled={isSubmitting}
                placeholder="예: 우유, 계란 등"
                style={inputStyle('name')}
              />
            </div>

            {/* Quantity + Expiry row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 80 }}>
                <label style={labelStyle}>qty</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onFocus={() => setFocusedField('qty')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isSubmitting}
                  style={inputStyle('qty')}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  expiry <span style={requiredDot} />
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  onFocus={() => setFocusedField('expiry')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isSubmitting}
                  style={{
                    ...inputStyle('expiry'),
                    colorScheme: 'dark',
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>category</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onFocus={() => setFocusedField('category')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  style={selectStyle('category')}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 14,
                    color: '#6e7681',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>zone</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setFocusedField('zone')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  style={selectStyle('zone')}
                >
                  {LOCATIONS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <ChevronDown
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 14,
                    color: '#6e7681',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div style={{ padding: '0 12px' }}>
            <div style={{ borderBottom: '1px dashed #30363d' }} />
          </div>

          {/* Action buttons */}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              style={{
                ...mono,
                flex: 1,
                background: 'transparent',
                border: '1px solid #30363d',
                color: '#c9d1d9',
                padding: '7px 12px',
                fontSize: 11,
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: 1,
                transition: 'all 0.15s',
              }}
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
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...mono,
                flex: 2,
                background: isSubmitting ? '#161b22' : '#0d1117',
                border: `1px solid ${isSubmitting ? '#30363d' : '#3fb950'}`,
                color: isSubmitting ? '#6e7681' : '#3fb950',
                padding: '7px 12px',
                fontSize: 11,
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#0b1a0b';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(63, 185, 80, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isSubmitting ? '#161b22' : '#0d1117';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
                  processing...
                </>
              ) : (
                mode === 'create' ? '/save' : '/update'
              )}
            </button>
          </div>
        </form>

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
