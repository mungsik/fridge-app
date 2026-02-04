import { ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import { DND_TYPES, type DragItem } from './fridgeConstants';

interface FridgeShelfProps {
  zoneId: string;
  children: ReactNode;
  onDrop: (itemId: string, targetZone: string) => void;
}

export function FridgeShelf({ zoneId, children, onDrop }: FridgeShelfProps) {
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, { handled: boolean }, { isOver: boolean; canDrop: boolean }>({
    accept: DND_TYPES.FRIDGE_ITEM,
    drop: (dragItem) => {
      if (dragItem.sourceZone !== zoneId) {
        onDrop(dragItem.id, zoneId);
      }
      return { handled: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: !monitor.getItem() || monitor.getItem()?.sourceZone !== zoneId,
    }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className="h-full transition-all duration-200 overflow-auto"
      style={{
        borderRadius: 0,
        background: isOver && canDrop
          ? 'rgba(88, 166, 255, 0.1)'
          : 'transparent',
        border: isOver && canDrop
          ? '1px dashed #58a6ff'
          : '1px dashed transparent',
        imageRendering: 'pixelated',
      }}
    >
      <div className="flex flex-wrap gap-1 p-1 content-start">
        {children}
      </div>
    </div>
  );
}
