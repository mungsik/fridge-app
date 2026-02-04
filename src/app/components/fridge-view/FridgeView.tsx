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
import { useAuth } from '@/app/contexts/AuthContext';

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

interface FridgeViewProps {
  items: FridgeItem[];
  onEdit: (item: FridgeItem) => void;
  onDelete: (id: string) => void;
  onUpdateLocation: (item: FridgeItem, newLocation: string) => void;
  onAdd?: () => void;
  isAdmin: boolean;
}

export function FridgeView({ items, onEdit, onDelete, onUpdateLocation, onAdd }: FridgeViewProps) {
  const { user } = useAuth();
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

    // Sort unplaced: own items first
    const currentUserId = user?.id;
    if (currentUserId) {
      unplaced.sort((a, b) => {
        const aIsMine = a.userId === currentUserId ? 0 : 1;
        const bIsMine = b.userId === currentUserId ? 0 : 1;
        return aIsMine - bIsMine;
      });
    }

    return { placedItems: placed, unplacedItems: unplaced };
  }, [items, user?.id]);

  const handleDrop = (itemId: string, targetZone: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    onUpdateLocation(item, targetZone);
  };

  const handleUnplace = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    onUpdateLocation(item, '');
  };

  const handleRemoveFromFridge = (item: FridgeItem) => {
    onUpdateLocation(item, '');
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
      <UnplaceDropZone onDelete={onDelete}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 0.3fr', gap: 24, alignItems: 'start' }}>
          {/* Item panel (left, fills remaining space) */}
          <ItemPanel items={unplacedItems} onUnplace={handleUnplace} onItemClick={setSelectedItem} onAdd={onAdd} onDelete={onDelete} currentUserId={user?.id} />

          {/* Fridge (right, fixed size) */}
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
      </UnplaceDropZone>

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

function UnplaceDropZone({ children, onDelete }: { children: React.ReactNode; onDelete: (id: string) => void }) {
  const [{ isOver }, drop] = useDrop<DragItem, { handled: boolean }, { isOver: boolean }>({
    accept: DND_TYPES.FRIDGE_ITEM,
    drop: (dragItem, monitor) => {
      if (monitor.didDrop()) return;
      onDelete(dragItem.id);
      return { handled: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const showIndicator = isOver;

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="relative">
      {children}
      {showIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            className="flex items-center gap-3"
            style={{
              background: '#0d1117',
              border: '1px solid #f85149',
              padding: '10px 20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              ...mono,
              color: '#f85149',
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          >
            <Trash2 className="h-6 w-6" />
            <span>▶ DROP = DELETE ◀</span>
          </div>
        </div>
      )}
    </div>
  );
}
