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
      className="h-full rounded-md transition-all duration-200 overflow-auto"
      style={{
        background: isOver && canDrop
          ? 'rgba(59, 130, 246, 0.15)'
          : canDrop
            ? 'rgba(59, 130, 246, 0.05)'
            : 'transparent',
        boxShadow: isOver && canDrop
          ? 'inset 0 0 12px rgba(59, 130, 246, 0.3)'
          : 'none',
        border: isOver && canDrop
          ? '2px dashed #3B82F6'
          : '2px dashed transparent',
      }}
    >
      <div className="flex flex-wrap gap-1 p-1 content-start">
        {children}
      </div>
    </div>
  );
}
