import { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'motion/react';
import { FridgeItem } from '@/app/types/fridge';
import { DND_TYPES } from './fridgeConstants';
import { PixelFoodIcon } from './PixelFoodIcon';
import { getItemImageUrl } from '@/app/utils/itemImage';
import { differenceInDays } from 'date-fns';

interface FridgeItemSpriteProps {
  item: FridgeItem;
  sourceZone: string;
  onClick: (item: FridgeItem) => void;
}

function getExpiryStatus(expiryDate: string) {
  const days = differenceInDays(new Date(expiryDate), new Date());
  if (days < 0) return 'expired';
  if (days <= 3) return 'expiring';
  return 'fresh';
}

export function FridgeItemSprite({ item, sourceZone, onClick }: FridgeItemSpriteProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    getItemImageUrl(item.name, item.category).then((url) => {
      if (url && !url.endsWith('default.svg')) setImageUrl(url);
    });
  }, [item.name, item.category]);

  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.FRIDGE_ITEM,
    item: { type: DND_TYPES.FRIDGE_ITEM, id: item.id, sourceZone },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const status = getExpiryStatus(item.expiryDate);

  const statusColor =
    status === 'expired' ? '#f85149' :
    status === 'expiring' ? '#d29922' :
    '#3fb950';

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className="cursor-grab active:cursor-grabbing"
      style={{ width: 56 }}
    >
    <motion.div
      layout
      initial={{ scale: 0, rotate: -180 }}
      animate={{
        scale: isDragging ? 1.1 : 1,
        rotate: 0,
        opacity: isDragging ? 0.5 : 1,
        y: status === 'expiring' ? [0, -2, 0] : 0,
      }}
      transition={
        status === 'expiring'
          ? { y: { repeat: Infinity, duration: 1.2 }, scale: { type: 'spring' }, rotate: { type: 'spring' } }
          : { type: 'spring', stiffness: 300, damping: 20 }
      }
      onClick={(e) => { e.stopPropagation(); onClick(item); }}
      className="relative flex flex-col items-center"
      style={{ width: 56, imageRendering: 'pixelated' }}
      title={`${item.name} (${item.quantity}개)${item.ownerName ? ` - ${item.ownerName}` : ''}`}
    >
      {/* Status indicator */}
      <div
        className="absolute -top-0.5 -right-0.5 z-10"
        style={{
          width: 8,
          height: 8,
          background: statusColor,
          border: '1px solid rgba(0,0,0,0.4)',
          boxShadow: status === 'expired' ? `0 0 4px ${statusColor}` : 'none',
        }}
      />

      {/* Expired blink overlay */}
      {status === 'expired' && (
        <motion.div
          className="absolute inset-0 z-[1]"
          style={{ background: '#f85149', pointerEvents: 'none' }}
          animate={{ opacity: [0.05, 0.25, 0.05] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      )}

      {/* Food icon with border */}
      <div
        style={{
          border: `1px solid ${status === 'expired' ? '#f85149' : status === 'expiring' ? '#d29922' : '#30363d'}`,
          background: '#0d1117',
          padding: 1,
          filter: status === 'expired' ? 'grayscale(0.5)' : 'none',
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} width={42} height={42} style={{ imageRendering: 'pixelated' }} />
        ) : (
          <PixelFoodIcon name={item.name} category={item.category} size={42} />
        )}
      </div>

      {/* Item name */}
      <span
        className="text-center leading-tight mt-0.5 truncate w-full"
        style={{
          fontSize: 9,
          color: '#c9d1d9',
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          fontWeight: 'bold',
          textShadow: '0 1px 0 rgba(0,0,0,0.8)',
        }}
      >
        {item.name}
      </span>

      {/* Quantity badge */}
      {item.quantity > 1 && (
        <span
          className="absolute -bottom-0.5 -left-0.5 text-center font-bold"
          style={{
            fontSize: 7,
            width: 14,
            height: 14,
            lineHeight: '14px',
            color: '#7ee787',
            background: '#0d1117',
            border: '1px solid #30363d',
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
          }}
        >
          {item.quantity}
        </span>
      )}
    </motion.div>
    </div>
  );
}
