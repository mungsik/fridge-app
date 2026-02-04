import { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'motion/react';
import { FridgeItem } from '@/app/types/fridge';
import { DND_TYPES } from './fridgeConstants';
import { PixelFoodIcon } from './PixelFoodIcon';
import { getItemImageUrl } from '@/app/utils/itemImage';
import { differenceInDays } from 'date-fns';

interface ItemPanelDraggableProps {
  item: FridgeItem;
  onClick?: (item: FridgeItem) => void;
}

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

export function ItemPanelDraggable({ item, onClick }: ItemPanelDraggableProps) {
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

  const borderColor = isExpired ? '#f85149' : isExpiring ? '#d29922' : '#30363d';
  const statusColor = isExpired ? '#f85149' : isExpiring ? '#d29922' : '#3fb950';
  const qtyColor = isExpired ? '#f85149' : isExpiring ? '#d29922' : '#7ee787';

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className="cursor-grab active:cursor-grabbing"
    >
    <motion.div
      onClick={() => onClick?.(item)}
      animate={isExpired ? { opacity: [1, 0.5, 1] } : {}}
      transition={isExpired ? { repeat: Infinity, duration: 1.2 } : {}}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        background: '#0d1117',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 0,
        opacity: isDragging ? 0.3 : 1,
        imageRendering: 'pixelated',
      }}
    >
      {/* 아이콘 */}
      <div style={{
        border: '1px solid #30363d',
        background: '#161b22',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} width={30} height={30} style={{ imageRendering: 'pixelated' }} />
        ) : (
          <PixelFoodIcon name={item.name} category={item.category} size={30} />
        )}
      </div>

      {/* 이름 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          ...mono, fontSize: 11, fontWeight: 600,
          color: '#c9d1d9',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </div>
      </div>

      {/* 수량 */}
      <span style={{
        ...mono, fontSize: 10, fontWeight: 'bold',
        color: qtyColor,
      }}>
        x{item.quantity}
      </span>

      {/* 상태 */}
      <span style={{
        ...mono, fontSize: 9, fontWeight: 'bold',
        color: statusColor,
        minWidth: 32,
        textAlign: 'right',
      }}>
        {isExpired ? '⚠ 만료' : `D-${days}`}
      </span>
    </motion.div>
    </div>
  );
}
