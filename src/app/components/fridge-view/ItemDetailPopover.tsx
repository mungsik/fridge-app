import { useState, useEffect } from 'react';
import { FridgeItem } from '@/app/types/fridge';
import { Pencil, Trash2, ArrowRightFromLine } from 'lucide-react';
import { PixelFoodIcon } from './PixelFoodIcon';
import { getItemImageUrl } from '@/app/utils/itemImage';
import { differenceInDays } from 'date-fns';
import { FRIDGE_ZONES, ZONE_IDS } from './fridgeConstants';

interface ItemDetailPopoverProps {
  item: FridgeItem;
  onEdit: (item: FridgeItem) => void;
  onDelete: (id: string) => void;
  onRemoveFromFridge: (item: FridgeItem) => void;
  onClose: () => void;
}

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

export function ItemDetailPopover({ item, onEdit, onDelete, onRemoveFromFridge, onClose }: ItemDetailPopoverProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.imageUrl) {
      setImageUrl(item.imageUrl);
      return;
    }
    getItemImageUrl(item.name, item.category).then((url) => {
      if (url && !url.endsWith('default.svg')) setImageUrl(url);
    });
  }, [item.name, item.category, item.imageUrl]);

  const days = differenceInDays(new Date(item.expiryDate), new Date());
  const isExpired = days < 0;
  const isExpiring = days >= 0 && days <= 3;

  const zoneName = FRIDGE_ZONES.find(z => z.id === item.location)?.label || item.location;

  const statusColor = isExpired ? '#f85149' : isExpiring ? '#d29922' : '#3fb950';
  const statusText = isExpired ? `EXPIRED (${Math.abs(days)}d ago)` : `D-${days}`;
  const isInFridge = ZONE_IDS.includes(item.location);

  const btnStyle: React.CSSProperties = {
    ...mono,
    background: 'transparent',
    border: '1px solid #30363d',
    color: '#c9d1d9',
    padding: '6px 10px',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 340,
          background: '#161b22',
          border: '1px solid #30363d',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          imageRendering: 'pixelated',
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        <div style={{
          background: '#0d1117',
          padding: '8px 14px',
          borderBottom: '1px solid #30363d',
          ...mono, fontSize: 11, fontWeight: 'bold',
          color: '#58a6ff', letterSpacing: 1, textAlign: 'center',
        }}>
          ┌── ITEM INFO ──┐
        </div>

        <div style={{ padding: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <div style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              padding: 4,
            }}>
              {imageUrl ? (
                <img src={imageUrl} alt={item.name} width={48} height={48} style={{
                  objectFit: 'cover',
                  imageRendering: item.imageUrl ? 'auto' : 'pixelated',
                }} />
              ) : (
                <PixelFoodIcon name={item.name} category={item.category} size={48} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...mono, fontSize: 16, fontWeight: 'bold', color: '#c9d1d9', wordBreak: 'break-word' }}>
                {item.name}
              </div>
              <div style={{ ...mono, fontSize: 11, color: '#7ee787', marginTop: 2 }}>
                x{item.quantity}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 10, padding: '4px 8px',
            background: '#0d1117', border: `1px solid ${statusColor}`,
          }}>
            <div style={{ width: 8, height: 8, background: statusColor }} />
            <span style={{ ...mono, fontSize: 10, fontWeight: 'bold', color: statusColor }}>
              {statusText}
            </span>
          </div>

          {/* Details */}
          <div style={{ ...mono, fontSize: 12, color: '#c9d1d9', marginBottom: 14, lineHeight: 1.8 }}>
            <div><span style={{ color: '#6e7681' }}>expiry  </span>{item.expiryDate}</div>
            {item.category && <div><span style={{ color: '#6e7681' }}>type    </span>{item.category}</div>}
            <div><span style={{ color: '#6e7681' }}>zone    </span>{zoneName}</div>
            {item.ownerName && <div><span style={{ color: '#6e7681' }}>owner   </span><span style={{ color: '#58a6ff' }}>{item.ownerName}</span></div>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4, borderTop: '1px solid #30363d', paddingTop: 10 }}>
            <button
              style={btnStyle}
              onClick={() => { onEdit(item); onClose(); }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#58a6ff'; e.currentTarget.style.color = '#58a6ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#c9d1d9'; }}
            >
              <Pencil style={{ width: 12, height: 12 }} />
              /edit
            </button>
            {isInFridge && (
              <button
                style={btnStyle}
                onClick={() => { onRemoveFromFridge(item); onClose(); }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d29922'; e.currentTarget.style.color = '#d29922'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#c9d1d9'; }}
              >
                <ArrowRightFromLine style={{ width: 12, height: 12 }} />
                /out
              </button>
            )}
            <button
              style={{ ...btnStyle, flex: 'none', color: '#f85149' }}
              onClick={() => { onDelete(item.id); onClose(); }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f85149'; e.currentTarget.style.background = '#1a0e0e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
