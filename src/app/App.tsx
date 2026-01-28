import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { FridgeItemForm } from '@/app/components/FridgeItemForm';
import { FridgeItemCard } from '@/app/components/FridgeItemCard';
import { NotificationBanner } from '@/app/components/NotificationBanner';
import { FridgeItem } from '@/app/types/fridge';
import { Plus, Search, Refrigerator, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { useFridgeItems } from '@/app/hooks/useFridgeItems';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

export default function App() {
  const {
    items,
    isLoading,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem
  } = useFridgeItems();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (itemData: Omit<FridgeItem, 'id' | 'createdAt'>) => {
    try {
      setIsSubmitting(true);
      await createItem(itemData);
      toast.success('식품이 등록되었습니다.');
    } catch (err) {
      toast.error('식품 등록에 실패했습니다.');
      console.error('Create failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (itemData: Omit<FridgeItem, 'id' | 'createdAt'>) => {
    if (!editingItem) return;

    try {
      setIsSubmitting(true);
      await updateItem(editingItem.id, itemData);
      setEditingItem(null);
      toast.success('식품이 수정되었습니다.');
    } catch (err) {
      toast.error('식품 수정에 실패했습니다.');
      console.error('Update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success('식품이 삭제되었습니다.');
    } catch (err) {
      toast.error('식품 삭제에 실패했습니다.');
      console.error('Delete failed:', err);
    }
  };

  const openEditForm = (item: FridgeItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <p className="font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
            <p className="text-sm mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Refrigerator className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">사내 냉장고 관리</h1>
              </div>
              <p className="text-gray-600">식품 등록하고 유통기한을 관리하세요</p>
            </div>
            <Button variant="ghost" size="icon" onClick={refetch} title="새로고침">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Notifications */}
        <div className="mb-6">
          <NotificationBanner items={items} />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="식품명, 카테고리, 위치로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="카테고리 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setIsFormOpen(true)} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              새 식품 등록
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Refrigerator className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {items.length === 0 ? '등록된 식품이 없습니다' : '검색 결과가 없습니다'}
            </h3>
            <p className="text-gray-500 mb-4">
              {items.length === 0 ? '첫 번째 식품을 등록해보세요!' : '다른 검색어를 시도해보세요.'}
            </p>
            {items.length === 0 && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                식품 등록하기
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <FridgeItemCard
                key={item.id}
                item={item}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {items.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{items.length}</p>
                <p className="text-sm text-gray-600">전체 식품</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {items.filter(item => {
                    const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return diff < 0;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">유통기한 만료</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {items.filter(item => {
                    const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return diff >= 0 && diff <= 3;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">곧 만료</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{categories.length}</p>
                <p className="text-sm text-gray-600">카테고리</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Form Dialog */}
      <FridgeItemForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSubmit={editingItem ? handleEdit : handleCreate}
        initialData={editingItem || undefined}
        mode={editingItem ? 'edit' : 'create'}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
