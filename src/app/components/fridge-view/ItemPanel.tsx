import { useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { FridgeItem } from '@/app/types/fridge';
import { DND_TYPES, DragItem } from './fridgeConstants';
import { ItemPanelDraggable } from './ItemPanelDraggable';
import { Package, Undo2, Plus, Trash2 } from 'lucide-react';

interface ItemPanelProps {
  items: FridgeItem[];
  onUnplace?: (id: string) => void;
  onItemClick?: (item: FridgeItem) => void;
  onAdd?: () => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

export function ItemPanel({ items, onUnplace, onItemClick, onAdd, onDelete, currentUserId }: ItemPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach(id => onDelete?.(id));
    setSelectedIds(new Set());
  }, [selectedIds, onDelete]);

  const [{ isOver }, drop] = useDrop({
    accept: DND_TYPES.FRIDGE_ITEM,
    drop: (dragItem: DragItem) => {
      if (dragItem.sourceZone && onUnplace) {
        onUnplace(dragItem.id);
      }
      return { handled: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && !!monitor.getItem()?.sourceZone,
    }),
  });


  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className="transition-colors"
      style={{
        width: '100%',
        background: isOver ? '#1a2030' : '#161b22',
        border: '1px solid #30363d',
        imageRendering: 'pixelated',
        padding: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#0d1117',
          padding: '6px 10px',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Package className="h-4 w-4" style={{ color: '#58a6ff' }} />
        <span style={{ ...mono, fontSize: 12, fontWeight: 'bold', color: '#c9d1d9', letterSpacing: 1 }}>
          INVENTORY
        </span>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBatchDelete}
            style={{
              ...mono,
              marginLeft: 'auto',
              background: '#1a0e0e',
              border: '1px solid #f85149',
              color: '#f85149',
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              letterSpacing: 1,
            }}
          >
            <Trash2 style={{ width: 10, height: 10 }} />
            /rm ({selectedIds.size})
          </button>
        )}
        <span
          style={{
            ...mono,
            marginLeft: selectedIds.size > 0 ? 0 : 'auto',
            fontSize: 11,
            color: '#58a6ff',
            background: '#0d1117',
            border: '1px solid #30363d',
            padding: '0 6px',
            fontWeight: 'bold',
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Divider */}
      <div style={{ padding: '0 10px' }}>
        <div style={{ borderBottom: '1px dashed #30363d' }} />
      </div>

      {/* Content */}
      <div style={{ padding: 8 }}>
        {isOver ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#58a6ff' }}>
            <Undo2 className="h-8 w-8 mx-auto mb-2" />
            <p style={{ ...mono, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 }}>
              ▼ DROP HERE ▼
            </p>
          </div>
        ) : items.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '20px 0',
            color: '#6e7681', ...mono, fontSize: 11,
          }}>
            <p>— empty —</p>
            <p style={{ marginTop: 4, fontSize: 10 }}>모든 아이템이 냉장고에 있습니다</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {items.map(item => (
              <ItemPanelDraggable key={item.id} item={item} onClick={onItemClick} onDelete={onDelete} isMine={!!currentUserId && item.userId === currentUserId} isSelected={selectedIds.has(item.id)} onSelect={toggleSelect} />
            ))}
          </div>
        )}
      </div>

      {/* Add button */}
      {onAdd && (
        <div style={{ padding: '6px 8px 4px' }}>
          <button
            onClick={onAdd}
            style={{
              ...mono,
              width: '100%',
              background: '#0d1117',
              border: '1px solid #30363d',
              color: '#3fb950',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3fb950';
              e.currentTarget.style.boxShadow = '0 0 6px rgba(63, 185, 80, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#30363d';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus style={{ width: 12, height: 12 }} />
            /add
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '0 10px' }}>
        <div style={{ borderBottom: '1px dashed #30363d' }} />
      </div>
      <div style={{ padding: '4px 8px', textAlign: 'center' }}>
        <p style={{ ...mono, fontSize: 10, color: '#6e7681', letterSpacing: 1 }}>
          DRAG → FRIDGE
        </p>
      </div>

      <style>{`
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          max-height: 520px;
          overflow-y: auto;
        }
        @media (min-width: 768px) {
          .inventory-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
