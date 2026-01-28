import { useState, useEffect, useCallback } from 'react';
import { FridgeItem } from '@/app/types/fridge';
import { fridgeItemsApi } from '@/lib/api/fridgeItems';

interface UseFridgeItemsResult {
  items: FridgeItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createItem: (item: Omit<FridgeItem, 'id' | 'createdAt'>) => Promise<FridgeItem>;
  updateItem: (id: string, item: Omit<FridgeItem, 'id' | 'createdAt'>) => Promise<FridgeItem>;
  deleteItem: (id: string) => Promise<void>;
}

export function useFridgeItems(): UseFridgeItemsResult {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fridgeItemsApi.getAll();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load items';
      setError(message);
      console.error('Failed to fetch items:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = useCallback(async (itemData: Omit<FridgeItem, 'id' | 'createdAt'>) => {
    const newItem = await fridgeItemsApi.create(itemData);
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback(async (id: string, itemData: Omit<FridgeItem, 'id' | 'createdAt'>) => {
    const updatedItem = await fridgeItemsApi.update(id, itemData);
    setItems(prev => prev.map(item =>
      item.id === id ? updatedItem : item
    ));
    return updatedItem;
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await fridgeItemsApi.delete(id);
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
}
