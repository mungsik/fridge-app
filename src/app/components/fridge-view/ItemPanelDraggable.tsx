import { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { FridgeItem } from '@/app/types/fridge';
import { DND_TYPES } from './fridgeConstants';
import { PixelFoodIcon } from './PixelFoodIcon';
import { getItemImageUrl } from '@/app/utils/itemImage';
import { differenceInDays } from 'date-fns';

interface ItemPanelDraggableProps {
  item: FridgeItem;
}

export function ItemPanelDraggable({ item }: ItemPanelDraggableProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    getItemImageUrl(item.name, item.category).then(setImageUrl);
  }, [item.name, item.category]);

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

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`
        flex items-center gap-2 p-2 rounded-lg border-2 cursor-grab active:cursor-grabbing
        transition-all duration-150
        ${isDragging ? 'opacity-40 border-dashed' : 'opacity-100'}
        ${isExpired ? 'border-red-300 bg-red-50' : isExpiring ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}
        hover:border-blue-300 hover:shadow-sm
      `}
    >
      {imageUrl && imageUrl !== '/images/items/default.svg' ? (
        <img src={imageUrl} alt={item.name} width={28} height={28} className="rounded object-cover" />
      ) : (
        <PixelFoodIcon name={item.name} category={item.category} size={28} />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{item.name}</div>
        <div className="text-xs text-gray-500">
          {item.quantity}개 ·{' '}
          <span className={isExpired ? 'text-red-500 font-bold' : isExpiring ? 'text-orange-500' : ''}>
            {isExpired ? '만료됨' : `D-${days}`}
          </span>
        </div>
      </div>
    </div>
  );
}
