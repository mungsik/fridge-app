import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { AlertCircle, Bell } from 'lucide-react';
import { FridgeItem } from '@/app/types/fridge';
import { differenceInDays } from 'date-fns';

interface NotificationBannerProps {
  items: FridgeItem[];
}

function HoverItemName({ item }: { item: FridgeItem }) {
  if (!item.ownerName) {
    return <span>{item.name}</span>;
  }

  return (
    <span className="relative group/item inline-block">
      <span className="underline decoration-dotted cursor-default">{item.name}</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-10">
        {item.ownerName}
      </span>
    </span>
  );
}

export function NotificationBanner({ items }: NotificationBannerProps) {
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
    itemList.map((item, idx) => (
      <span key={item.id}>
        {idx > 0 && ', '}
        <HoverItemName item={item} />
      </span>
    ))
  );

  return (
    <div className="space-y-2">
      {expiredItems.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>유통기한 만료</AlertTitle>
          <AlertDescription>
            {expiredItems.length}개의 식품이 유통기한이 지났습니다: {renderItemList(expiredItems)}
          </AlertDescription>
        </Alert>
      )}

      {expiringSoonItems.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">곧 유통기한 만료</AlertTitle>
          <AlertDescription className="text-orange-800">
            {expiringSoonItems.length}개의 식품이 3일 이내에 유통기한이 만료됩니다: {renderItemList(expiringSoonItems)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
