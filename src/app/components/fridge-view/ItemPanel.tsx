import { useDrop } from 'react-dnd';
import { FridgeItem } from '@/app/types/fridge';
import { DND_TYPES, DragItem } from './fridgeConstants';
import { ItemPanelDraggable } from './ItemPanelDraggable';
import { Package, Undo2, Plus } from 'lucide-react';

interface ItemPanelProps {
  items: FridgeItem[];
  onUnplace?: (id: string) => void;
  onItemClick?: (item: FridgeItem) => void;
  onAdd?: () => void;
  onDelete?: (id: string) => void;
}

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

export function ItemPanel({ items, onUnplace, onItemClick, onAdd, onDelete }: ItemPanelProps) {
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
      className="w-[260px] transition-colors"
      style={{
        background: isOver ? '#1a2030' : '#161b22',
        border: '1px solid #30363d',
        imageRendering: 'pixelated',
        padding: 0,
      }}
    >
      {/* 헤더 */}
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
        <span
          style={{
            ...mono,
            marginLeft: 'auto',
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

      {/* 구분선 */}
      <div style={{ padding: '0 10px' }}>
        <div style={{ borderBottom: '1px dashed #30363d' }} />
      </div>

      {/* 콘텐츠 */}
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
          <div className="space-y-1 max-h-[480px] overflow-y-auto">
            {items.map(item => (
              <ItemPanelDraggable key={item.id} item={item} onClick={onItemClick} onDelete={onDelete} />
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

      {/* 구분선 + 푸터 */}
      <div style={{ padding: '0 10px' }}>
        <div style={{ borderBottom: '1px dashed #30363d' }} />
      </div>
      <div style={{ padding: '4px 8px', textAlign: 'center' }}>
        <p style={{ ...mono, fontSize: 10, color: '#6e7681', letterSpacing: 1 }}>
          DRAG → FRIDGE
        </p>
      </div>
    </div>
  );
}
