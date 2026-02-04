import { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { FridgeItem } from '@/app/types/fridge';
import { ZONE_IDS } from './fridgeConstants';
import { FridgeShell } from './FridgeShell';
import { FridgeShelf } from './FridgeShelf';
import { FridgeItemSprite } from './FridgeItemSprite';
import { ItemPanel } from './ItemPanel';
import { ItemDetailPopover } from './ItemDetailPopover';
import { useAuth } from '@/app/contexts/AuthContext';

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

  const isTouchDevice = 'ontouchstart' in window;
  const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={dndBackend} options={isTouchDevice ? { enableMouseEvents: true } : undefined}>
        <div className="fridge-layout">
          {/* Item panel — order-2 on mobile (below fridge), order-1 on desktop (left) */}
          <div className="fridge-layout-inventory">
            <ItemPanel items={unplacedItems} onUnplace={handleUnplace} onItemClick={setSelectedItem} onAdd={onAdd} onDelete={onDelete} currentUserId={user?.id} />
          </div>

          {/* Fridge — order-1 on mobile (top), order-2 on desktop (right) */}
          <div className="fridge-layout-fridge">
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
        </div>
      <style>{`
        .fridge-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        .fridge-layout-inventory { order: 2; }
        .fridge-layout-fridge { order: 1; }

        @media (min-width: 768px) {
          .fridge-layout {
            grid-template-columns: 1fr 280px;
            gap: 24px;
          }
          .fridge-layout-inventory { order: 1; }
          .fridge-layout-fridge { order: 2; }
        }
      `}</style>

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

