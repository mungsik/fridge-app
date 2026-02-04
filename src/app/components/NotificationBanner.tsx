import { FridgeItem } from '@/app/types/fridge';
import { differenceInDays } from 'date-fns';

interface NotificationBannerProps {
  items: FridgeItem[];
  isAdmin?: boolean;
}

const mono: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
};

const tc = {
  bg: '#0d1117',
  border: '#30363d',
  text: '#c9d1d9',
  textDim: '#6e7681',
  red: '#f85149',
  yellow: '#d29922',
  cyan: '#58a6ff',
  coral: '#f0a090',
};

function HoverItemName({ item, isAdmin }: { item: FridgeItem; isAdmin?: boolean }) {
  if (!item.ownerName || !isAdmin) {
    return <span>{item.name}</span>;
  }

  return (
    <span className="relative group/item inline-block">
      <span className="cursor-default" style={{ borderBottom: `1px dotted ${tc.cyan}` }}>{item.name}</span>
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-10"
        style={{
          ...mono,
          background: tc.bg,
          color: tc.cyan,
          border: `1px solid ${tc.border}`,
          padding: '2px 8px',
          fontSize: 12,
          whiteSpace: 'nowrap',
        }}
      >
        {item.ownerName}
      </span>
    </span>
  );
}

export function NotificationBanner({ items, isAdmin }: NotificationBannerProps) {
  const today = new Date();

  const expiredItems = items.filter(item => {
    const expiry = new Date(item.expiryDate);
    return differenceInDays(expiry, today) < 0;
  });

  const expiringSoonItems = items.filter(item => {
    const expiry = new Date(item.expiryDate);
    const days = differenceInDays(expiry, today);
    return days >= 0 && days <= 3;
  });

  if (expiredItems.length === 0 && expiringSoonItems.length === 0) {
    return null;
  }

  const renderItemList = (itemList: FridgeItem[]) => (
    <div style={{ paddingLeft: 16, marginTop: 4 }}>
      {itemList.map(item => (
        <div key={item.id} style={{ marginTop: 2 }}>
          <span style={{ color: tc.textDim }}>  ● </span>
          <HoverItemName item={item} isAdmin={isAdmin} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...mono, fontSize: 13 }}>
      {expiredItems.length > 0 && (
        <div style={{ border: `1px solid ${tc.red}`, padding: 12 }}>
          <div>
            <span style={{ color: tc.red }}>$ </span>
            <span style={{ color: tc.red }}>cat /var/log/expired</span>
          </div>
          <div style={{ marginTop: 4, color: tc.red }}>
            ERROR: {expiredItems.length}개의 식품이 유통기한이 지났습니다
          </div>
          {renderItemList(expiredItems)}
        </div>
      )}

      {expiringSoonItems.length > 0 && (
        <div style={{ border: `1px solid ${tc.yellow}`, padding: 12 }}>
          <div>
            <span style={{ color: tc.yellow }}>$ </span>
            <span style={{ color: tc.yellow }}>cat /var/log/warning</span>
          </div>
          <div style={{ marginTop: 4, color: tc.yellow }}>
            WARN: {expiringSoonItems.length}개의 식품이 3일 이내에 만료됩니다
          </div>
          {renderItemList(expiringSoonItems)}
        </div>
      )}
    </div>
  );
}
