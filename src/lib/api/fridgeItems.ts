import { supabase } from '../supabase';
import type { FridgeItem } from '@/app/types/fridge';
import type { DbFridgeItem } from '../database.types';

// Transform database row to frontend interface
function toFridgeItem(row: DbFridgeItem): FridgeItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    expiryDate: row.expiry_date,
    category: row.category,
    location: row.location,
    createdAt: row.created_at,
  };
}

// Transform frontend interface to database format
function toDbFormat(item: Omit<FridgeItem, 'id' | 'createdAt'>) {
  return {
    name: item.name,
    quantity: item.quantity,
    expiry_date: item.expiryDate,
    category: item.category || '',
    location: item.location || '',
  };
}

export const fridgeItemsApi = {
  // Fetch all items
  async getAll(): Promise<FridgeItem[]> {
    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch items: ${error.message}`);
    }

    return (data || []).map(toFridgeItem);
  },

  // Create new item
  async create(item: Omit<FridgeItem, 'id' | 'createdAt'>): Promise<FridgeItem> {
    const { data, error } = await supabase
      .from('fridge_items')
      .insert(toDbFormat(item))
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create item: ${error.message}`);
    }

    return toFridgeItem(data);
  },

  // Update existing item
  async update(id: string, item: Omit<FridgeItem, 'id' | 'createdAt'>): Promise<FridgeItem> {
    const { data, error } = await supabase
      .from('fridge_items')
      .update(toDbFormat(item))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update item: ${error.message}`);
    }

    return toFridgeItem(data);
  },

  // Delete item
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('fridge_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  },
};
