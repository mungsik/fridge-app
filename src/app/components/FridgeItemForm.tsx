import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { FridgeItem } from '@/app/types/fridge';
import { Loader2 } from 'lucide-react';

interface FridgeItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: Omit<FridgeItem, 'id' | 'createdAt'>) => void;
  initialData?: FridgeItem;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

export function FridgeItemForm({ open, onOpenChange, onSubmit, initialData, mode, isSubmitting = false }: FridgeItemFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '1');
  const [expiryDate, setExpiryDate] = useState(
    initialData?.expiryDate || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState(initialData?.category || '');
  const [location, setLocation] = useState(initialData?.location || '');

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setQuantity(initialData.quantity.toString());
      setExpiryDate(initialData.expiryDate);
      setCategory(initialData.category);
      setLocation(initialData.location);
    } else {
      setName('');
      setQuantity('1');
      setExpiryDate(new Date().toISOString().split('T')[0]);
      setCategory('');
      setLocation('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      quantity: parseInt(quantity) || 1,
      expiryDate,
      category,
      location,
    });

    // Reset form after successful submission
    if (!isSubmitting) {
      setName('');
      setQuantity('1');
      setExpiryDate(new Date().toISOString().split('T')[0]);
      setCategory('');
      setLocation('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '새 식품 등록' : '식품 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">식품명 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="예: 우유, 계란 등"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">수량</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiryDate">유통기한 *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: 유제품, 채소, 과일 등"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">위치</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 1층 냉장고, 2층 냉장고 등"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                mode === 'create' ? '등록' : '수정'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
