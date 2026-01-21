import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Pencil, Trash2, AlertCircle, Clock } from 'lucide-react';
import { FridgeItem, NotificationStatus } from '@/app/types/fridge';
import { differenceInDays } from 'date-fns';

interface FridgeItemCardProps {
  item: FridgeItem;
  onEdit: (item: FridgeItem) => void;
  onDelete: (id: string) => void;
}

export function FridgeItemCard({ item, onEdit, onDelete }: FridgeItemCardProps) {
  const getExpiryStatus = (): NotificationStatus => {
    const today = new Date();
    const expiry = new Date(item.expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring-soon';
    return 'fresh';
  };

  const status = getExpiryStatus();
  const daysUntilExpiry = differenceInDays(new Date(item.expiryDate), new Date());

  const getStatusBadge = () => {
    switch (status) {
      case 'expired':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            유통기한 만료
          </Badge>
        );
      case 'expiring-soon':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3" />
            {daysUntilExpiry}일 남음
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            {daysUntilExpiry}일 남음
          </Badge>
        );
    }
  };

  return (
    <Card className={status === 'expired' ? 'border-red-300 bg-red-50/50' : ''}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-1 mb-4 text-sm text-gray-600">
          <p>유통기한: {item.expiryDate}</p>
          {item.category && <p>카테고리: {item.category}</p>}
          {item.location && <p>위치: {item.location}</p>}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="flex-1 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
