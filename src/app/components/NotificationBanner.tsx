import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { AlertCircle, Bell } from 'lucide-react';
import { FridgeItem } from '@/app/types/fridge';
import { differenceInDays } from 'date-fns';

interface NotificationBannerProps {
  items: FridgeItem[];
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

  return (
    <div className="space-y-2">
      {expiredItems.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>유통기한 만료</AlertTitle>
          <AlertDescription>
            {expiredItems.length}개의 식품이 유통기한이 지났습니다: {expiredItems.map(i => i.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {expiringSoonItems.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">곧 유통기한 만료</AlertTitle>
          <AlertDescription className="text-orange-800">
            {expiringSoonItems.length}개의 식품이 3일 이내에 유통기한이 만료됩니다: {expiringSoonItems.map(i => i.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
