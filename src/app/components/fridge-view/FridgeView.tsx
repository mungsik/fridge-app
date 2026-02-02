import { useState, useMemo } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FridgeItem } from '@/app/types/fridge';
import { ZONE_IDS, DND_TYPES, DragItem } from './fridgeConstants';
import { FridgeShell } from './FridgeShell';
import { FridgeShelf } from './FridgeShelf';
import { FridgeItemSprite } from './FridgeItemSprite';
import { ItemPanel } from './ItemPanel';
import { ItemDetailPopover } from './ItemDetailPopover';
import { Trash2 } from 'lucide-react';

interface FridgeViewProps {
  items: FridgeItem[];
  onEdit: (item: FridgeItem) => void;
  onDelete: (id: string) => void;
  onUpdateLocation: (item: FridgeItem, newLocation: string) => void;
  isAdmin: boolean;
}

export function FridgeView({ items, onEdit, onDelete, onUpdateLocation }: FridgeViewProps) {
  const [selectedItem, setSelectedItem] = useState<FridgeItem | null>(null);
  const [openZones, setOpenZones] = useState<Set<string>>(new Set());

  const { placedItems, unplacedItems } = useMemo(() => {
    const placed: Record<string, FridgeItem[]> = {};
    const unplaced: FridgeItem[] = [];

    for (const zone of ZONE_IDS) {
      placed[zone] = [];
    }

    for (const item of items) {
      if (ZONE_IDS.includes(item.location)) {
        placed[item.location].push(item);
      } else {
        unplaced.push(item);
      }
    }

    return { placedItems: placed, unplacedItems: unplaced };
  }, [items]);

  const handleDrop = (itemId: string, targetZone: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    onUpdateLocation(item, targetZone);
  };

  const handleRemoveFromFridge = (item: FridgeItem) => {
    onDelete(item.id);
  };

  const handleZoneClick = (zone: string) => {
    setOpenZones(prev => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  };

  const renderShelfItems = (zoneId: string) => {
    return (placedItems[zoneId] || []).map(item => (
      <FridgeItemSprite
        key={item.id}
        item={item}
        sourceZone={zoneId}
        onClick={(clickedItem) => {
          setSelectedItem(clickedItem);
        }}
      />
    ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DeleteDropZone onDelete={onDelete}>
        <div className="flex gap-6 justify-center items-start">
          {/* Item panel (left) */}
          <ItemPanel items={unplacedItems} onDeleteById={(id) => onDelete(id)} />

          {/* Fridge (center) */}
          <FridgeShell
            openZones={openZones}
            onZoneClick={handleZoneClick}
            fridgeContent={
              <FridgeShelf zoneId="fridge" onDrop={handleDrop}>
                {renderShelfItems('fridge')}
              </FridgeShelf>
            }
            fridgeDoorContent={
              <FridgeShelf zoneId="fridge-door" onDrop={handleDrop}>
                {renderShelfItems('fridge-door')}
              </FridgeShelf>
            }
            freezerContent={
              <FridgeShelf zoneId="freezer" onDrop={handleDrop}>
                {renderShelfItems('freezer')}
              </FridgeShelf>
            }
            freezerDoorContent={
              <FridgeShelf zoneId="freezer-door" onDrop={handleDrop}>
                {renderShelfItems('freezer-door')}
              </FridgeShelf>
            }
          />
        </div>
      </DeleteDropZone>

      {/* Detail popover */}
      {selectedItem && (
        <ItemDetailPopover
          item={selectedItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onRemoveFromFridge={handleRemoveFromFridge}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </DndProvider>
  );
}

function DeleteDropZone({ children, onDelete }: { children: React.ReactNode; onDelete: (id: string) => void }) {
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, { handled: boolean }, { isOver: boolean; canDrop: boolean }>({
    accept: DND_TYPES.FRIDGE_ITEM,
    drop: (dragItem, monitor) => {
      // 내부 드롭 존(선반)이 이미 처리했으면 무시
      if (monitor.didDrop()) return;
      if (dragItem.sourceZone) {
        onDelete(dragItem.id);
      }
      return { handled: true };
    },
    canDrop: (dragItem) => !!dragItem.sourceZone,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const showTrash = isOver && canDrop;

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="relative">
      {children}
      {showTrash && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-red-500/80 text-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-lg">
            <Trash2 className="h-6 w-6" />
            <span className="font-bold">놓으면 삭제</span>
          </div>
        </div>
      )}
    </div>
  );
}
