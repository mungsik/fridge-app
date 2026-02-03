import { useDrop } from 'react-dnd';
import { FridgeItem } from '@/app/types/fridge';
import { DND_TYPES, DragItem } from './fridgeConstants';
import { ItemPanelDraggable } from './ItemPanelDraggable';
import { Package, Undo2 } from 'lucide-react';

interface ItemPanelProps {
  items: FridgeItem[];
  onUnplace?: (id: string) => void;
}

export function ItemPanel({ items, onUnplace }: ItemPanelProps) {
  const [{ isOver }, drop] = useDrop({
    accept: DND_TYPES.FRIDGE_ITEM,
    drop: (dragItem: DragItem) => {
      if (dragItem.sourceZone && onUnplace) {
        onUnplace(dragItem.id);
      }
    },
    canDrop: (dragItem: DragItem) => !!dragItem.sourceZone,
    collect: (monitor) => ({
      isOver: monitor.isOver() && monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className="rounded-lg border-2 shadow-sm p-3 w-[200px] transition-colors"
      style={{
        background: isOver ? '#DBEAFE' : 'white',
        borderColor: isOver ? '#3B82F6' : '#E5E7EB',
      }}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
        <Package className="h-4 w-4 text-gray-500" />
        <span className="font-bold text-sm text-gray-700">미배치 아이템</span>
        <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-500 ml-auto">
          {items.length}
        </span>
      </div>

      {isOver ? (
        <div className="text-center py-6 text-blue-400">
          <Undo2 className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs font-bold">여기에 놓으면 미배치</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <p className="text-xs">모든 아이템이</p>
          <p className="text-xs">냉장고에 있습니다!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto">
          {items.map(item => (
            <ItemPanelDraggable key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="mt-3 pt-2 border-t text-center">
        <p className="text-xs text-gray-400 font-mono">드래그해서 냉장고에 넣기</p>
      </div>
    </div>
  );
}
