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
    getItemImageUrl(item.name, item.category).then(setImageUrl);
  }, [item.name, item.category]);

  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.FRIDGE_ITEM,
    item: { type: DND_TYPES.FRIDGE_ITEM, id: item.id, sourceZone },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const status = getExpiryStatus(item.expiryDate);

  return (
    <motion.div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
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
      className="relative cursor-grab active:cursor-grabbing flex flex-col items-center"
      style={{ width: 48 }}
      title={`${item.name} (${item.quantity}개)${item.ownerName ? ` - ${item.ownerName}` : ''}`}
    >
      {/* Status indicator */}
      <div
        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white z-10"
        style={{
          background:
            status === 'expired' ? '#EF4444' :
            status === 'expiring' ? '#F59E0B' :
            '#22C55E',
        }}
      />

      {/* Expired overlay */}
      {status === 'expired' && (
        <motion.div
          className="absolute inset-0 rounded bg-red-500 z-[1]"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Food icon */}
      <div
        className="rounded"
        style={{
          filter: status === 'expired' ? 'grayscale(0.5)' : 'none',
          boxShadow:
            status === 'expiring' ? '0 0 6px rgba(245, 158, 11, 0.5)' :
            status === 'expired' ? '0 0 6px rgba(239, 68, 68, 0.5)' :
            'none',
        }}
      >
        {imageUrl && imageUrl !== '/images/items/default.svg' ? (
          <img src={imageUrl} alt={item.name} width={36} height={36} className="rounded object-cover" />
        ) : (
          <PixelFoodIcon name={item.name} category={item.category} size={36} />
        )}
      </div>

      {/* Item name */}
      <span
        className="text-center leading-tight mt-0.5 font-mono truncate w-full"
        style={{ fontSize: 8, color: '#555' }}
      >
        {item.name}
      </span>

      {/* Quantity badge */}
      {item.quantity > 1 && (
        <span
          className="absolute -bottom-0.5 -left-0.5 bg-blue-500 text-white rounded-full text-center font-bold"
          style={{ fontSize: 7, width: 14, height: 14, lineHeight: '14px' }}
        >
          {item.quantity}
        </span>
      )}
    </motion.div>
  );
}
