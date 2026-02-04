import { useState, useEffect, useRef, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'motion/react';
import { FridgeItem } from '@/app/types/fridge';
import { DND_TYPES } from './fridgeConstants';
import { PixelFoodIcon } from './PixelFoodIcon';
import { getItemImageUrl } from '@/app/utils/itemImage';
import { differenceInDays } from 'date-fns';
import { Minus, Check } from 'lucide-react';

interface ItemPanelDraggableProps {
  item: FridgeItem;
  onClick?: (item: FridgeItem) => void;
  onDelete?: (id: string) => void;
  isMine?: boolean;
}

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };
const SWIPE_THRESHOLD = 50;
const DELETE_BTN_WIDTH = 48;

export function ItemPanelDraggable({ item, onClick, onDelete, isMine }: ItemPanelDraggableProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  useEffect(() => {
    if (item.imageUrl) {
      setImageUrl(item.imageUrl);
      return;
    }
    getItemImageUrl(item.name, item.category).then((url) => {
      if (url && !url.endsWith('default.svg')) setImageUrl(url);
    });
  }, [item.name, item.category, item.imageUrl]);

  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.FRIDGE_ITEM,
    item: { type: DND_TYPES.FRIDGE_ITEM, id: item.id, sourceZone: null },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const days = differenceInDays(new Date(item.expiryDate), new Date());
  const isExpired = days < 0;
  const isExpiring = days >= 0 && days <= 3;

  const borderColor = isExpired ? '#f85149' : isExpiring ? '#d29922' : isMine ? '#3fb950' : '#30363d';
  const statusColor = isExpired ? '#f85149' : isExpiring ? '#d29922' : '#3fb950';
  const qtyColor = isExpired ? '#f85149' : isExpiring ? '#d29922' : '#7ee787';

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!isSwiping.current && Math.abs(dy) > Math.abs(dx)) return;

    if (Math.abs(dx) > 10) {
      isSwiping.current = true;
    }

    if (isSwiping.current) {
      e.preventDefault();
      if (swiped) {
        setSwipeX(Math.min(0, Math.max(-DELETE_BTN_WIDTH, -DELETE_BTN_WIDTH + dx)));
      } else {
        const clampedX = Math.min(0, Math.max(-DELETE_BTN_WIDTH - 10, dx));
        setSwipeX(clampedX);
      }
    }
  }, [swiped]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;

    if (swiped) {
      if (swipeX > -DELETE_BTN_WIDTH / 2) {
        setSwipeX(0);
        setSwiped(false);
      } else {
        setSwipeX(-DELETE_BTN_WIDTH);
      }
    } else {
      if (swipeX < -SWIPE_THRESHOLD) {
        setSwipeX(-DELETE_BTN_WIDTH);
        setSwiped(true);
      } else {
        setSwipeX(0);
      }
    }
  }, [swiped, swipeX]);

  const handleDeleteClick = useCallback(() => {
    onDelete?.(item.id);
    setSwiped(false);
    setSwipeX(0);
  }, [onDelete, item.id]);

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className="cursor-grab active:cursor-grabbing"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Delete button behind (only visible when swiping) */}
      {(swiped || swipeX < 0) && (
        <div
          onClick={handleDeleteClick}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: DELETE_BTN_WIDTH,
            background: '#f85149',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 0,
          }}
        >
          <Minus style={{ color: '#fff', width: 20, height: 20, strokeWidth: 3 }} />
        </div>
      )}

      {/* Swipeable tile content */}
      <motion.div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => !isSwiping.current && onClick?.(item)}
        animate={{
          x: swipeX,
          ...(isExpired ? { opacity: [1, 0.5, 1] } : {}),
          ...(isMine && !isExpired ? { y: [0, -3, 0] } : {}),
        }}
        transition={{
          x: isSwiping.current
            ? { duration: 0 }
            : { type: 'spring', stiffness: 400, damping: 30 },
          ...(isExpired ? { opacity: { repeat: Infinity, duration: 1.2 } } : {}),
          ...(isMine && !isExpired ? { y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } } : {}),
        }}
        style={{
          background: '#0d1117',
          border: `1px solid ${borderColor}`,
          borderTop: `3px solid ${isMine && !isExpired && !isExpiring ? '#3fb950' : statusColor}`,
          boxShadow: isMine && !isExpired ? '0 0 6px rgba(63, 185, 80, 0.3)' : 'none',
          opacity: isDragging ? 0.3 : 1,
          imageRendering: 'pixelated',
          position: 'relative',
          zIndex: 1,
          touchAction: 'pan-y',
          padding: '8px 6px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* Mine badge */}
        {isMine && (
          <div style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 14,
            height: 14,
            background: '#3fb950',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}>
            <Check style={{ width: 10, height: 10, color: '#0d1117', strokeWidth: 3 }} />
          </div>
        )}

        {/* Icon */}
        <div style={{
          border: '1px solid #30363d',
          background: '#161b22',
          padding: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} width={36} height={36} style={{ imageRendering: item.imageUrl ? 'auto' : 'pixelated' }} />
          ) : (
            <PixelFoodIcon name={item.name} category={item.category} size={36} />
          )}
        </div>

        {/* Name */}
        <div style={{
          ...mono, fontSize: 10, fontWeight: 600,
          color: '#c9d1d9',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          width: '100%', textAlign: 'center',
        }}>
          {item.name}
        </div>

        {/* Qty + Status row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}>
          <span style={{ ...mono, fontSize: 9, fontWeight: 'bold', color: qtyColor }}>
            x{item.quantity}
          </span>
          <span style={{ ...mono, fontSize: 9, fontWeight: 'bold', color: statusColor }}>
            {isExpired ? '만료' : `D-${days}`}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
