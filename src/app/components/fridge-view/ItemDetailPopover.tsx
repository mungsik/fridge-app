import { FridgeItem } from '@/app/types/fridge';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Pencil, Trash2, ArrowRightFromLine, AlertCircle, Clock } from 'lucide-react';
import { PixelFoodIcon } from './PixelFoodIcon';
import { differenceInDays } from 'date-fns';
import { FRIDGE_ZONES } from './fridgeConstants';

interface ItemDetailPopoverProps {
  item: FridgeItem;
  onEdit: (item: FridgeItem) => void;
  onDelete: (id: string) => void;
  onRemoveFromFridge: (item: FridgeItem) => void;
  onClose: () => void;
}

export function ItemDetailPopover({ item, onEdit, onDelete, onRemoveFromFridge, onClose }: ItemDetailPopoverProps) {
  const days = differenceInDays(new Date(item.expiryDate), new Date());
  const isExpired = days < 0;
  const isExpiring = days >= 0 && days <= 3;

  const zoneName = FRIDGE_ZONES.find(z => z.id === item.location)?.label || item.location;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative bg-white rounded-xl shadow-xl p-4 w-[260px] border-2 border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <PixelFoodIcon name={item.name} category={item.category} size={40} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.quantity}개</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-3">
          {isExpired ? (
            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
              <AlertCircle className="h-3 w-3" />
              유통기한 만료 ({Math.abs(days)}일 전)
            </Badge>
          ) : isExpiring ? (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-orange-100 text-orange-800">
              <Clock className="h-3 w-3" />
              {days}일 남음
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1 w-fit bg-green-50 text-green-700 border-green-200">
              {days}일 남음
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1 mb-4 text-sm text-gray-600">
          <p>유통기한: {item.expiryDate}</p>
          {item.category && <p>카테고리: {item.category}</p>}
          <p>위치: {zoneName}</p>
          {item.ownerName && <p className="text-blue-600">등록자: {item.ownerName}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => { onEdit(item); onClose(); }}
          >
            <Pencil className="h-3 w-3 mr-1" />
            수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => { onRemoveFromFridge(item); onClose(); }}
          >
            <ArrowRightFromLine className="h-3 w-3 mr-1" />
            꺼내기
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={() => { onDelete(item.id); onClose(); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
