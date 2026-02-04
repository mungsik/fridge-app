import { Pencil, Trash2, Check } from 'lucide-react';
import { FridgeItem, NotificationStatus } from '@/app/types/fridge';
import { differenceInDays } from 'date-fns';

interface FridgeItemCardProps {
  item: FridgeItem;
  onEdit: (item: FridgeItem) => void;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
  isMine?: boolean;
}

const mono: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
};

const tc = {
  bg: '#0d1117',
  surface: '#161b22',
  border: '#30363d',
  text: '#c9d1d9',
  textDim: '#6e7681',
  green: '#3fb950',
  cyan: '#58a6ff',
  coral: '#f0a090',
  red: '#f85149',
  yellow: '#d29922',
};

export function FridgeItemCard({ item, onEdit, onDelete, isAdmin, isMine }: FridgeItemCardProps) {
  const getExpiryStatus = (): NotificationStatus => {
    const today = new Date();
    const expiry = new Date(item.expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring-soon';
    return 'fresh';
  };

  const status = getExpiryStatus();
  const daysUntilExpiry = differenceInDays(new Date(item.expiryDate), new Date());

  const statusColor = status === 'expired' ? tc.red : status === 'expiring-soon' ? tc.yellow : tc.green;
  const statusLabel = status === 'expired' ? 'EXPIRED' : `${daysUntilExpiry}d left`;

  return (
    <div
      style={{
        ...mono,
        background: tc.surface,
        border: `1px solid ${isMine ? tc.green : tc.border}`,
        boxShadow: isMine ? '0 0 6px rgba(63, 185, 80, 0.3)' : 'none',
        fontSize: 13,
      }}
    >
      {/* Header line */}
      <div style={{
        padding: '8px 12px',
        borderBottom: `1px solid ${tc.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ color: statusColor }}>●</span>
        {isMine && (
          <span style={{
            width: 16,
            height: 16,
            background: tc.green,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Check style={{ width: 10, height: 10, color: tc.bg, strokeWidth: 3 }} />
          </span>
        )}
        <span style={{ color: tc.text, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </span>
        <span style={{ color: tc.textDim, fontSize: 12 }}>x{item.quantity}</span>
      </div>

      {/* Content - terminal output style */}
      <div style={{ padding: '8px 12px', fontSize: 12, lineHeight: 1.8 }}>
        <div>
          <span style={{ color: tc.textDim }}>status  </span>
          <span style={{ color: statusColor }}>{statusLabel}</span>
        </div>
        <div>
          <span style={{ color: tc.textDim }}>expiry  </span>
          <span style={{ color: tc.text }}>{item.expiryDate}</span>
        </div>
        {item.category && (
          <div>
            <span style={{ color: tc.textDim }}>type    </span>
            <span style={{ color: tc.text }}>{item.category}</span>
          </div>
        )}
        {item.location && (
          <div>
            <span style={{ color: tc.textDim }}>zone    </span>
            <span style={{ color: tc.text }}>{item.location}</span>
          </div>
        )}
        {isAdmin && item.ownerName && (
          <div>
            <span style={{ color: tc.textDim }}>owner   </span>
            <span style={{ color: tc.cyan }}>{item.ownerName}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        borderTop: `1px solid ${tc.border}`,
        display: 'flex',
      }}>
        <button
          onClick={() => onEdit(item)}
          style={{
            ...mono,
            flex: 1,
            background: 'transparent',
            color: tc.textDim,
            border: 'none',
            borderRight: `1px solid ${tc.border}`,
            padding: '6px 0',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = tc.cyan; e.currentTarget.style.background = tc.bg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = tc.textDim; e.currentTarget.style.background = 'transparent'; }}
        >
          <Pencil style={{ width: 12, height: 12 }} />
          /edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          style={{
            ...mono,
            flex: 1,
            background: 'transparent',
            color: tc.textDim,
            border: 'none',
            padding: '6px 0',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = tc.red; e.currentTarget.style.background = tc.bg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = tc.textDim; e.currentTarget.style.background = 'transparent'; }}
        >
          <Trash2 style={{ width: 12, height: 12 }} />
          /rm
        </button>
      </div>
    </div>
  );
}
