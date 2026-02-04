import { supabase } from '../supabase';
import type { FridgeItem } from '@/app/types/fridge';
import type { DbFridgeItem } from '../database.types';

// Transform database row to frontend interface
function toFridgeItem(row: DbFridgeItem, ownerName?: string): FridgeItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    expiryDate: row.expiry_date,
    category: row.category,
    location: row.location,
    userId: row.user_id,
    ownerName,
    imageUrl: row.image_url || undefined,
    createdAt: row.created_at,
  };
}

// Transform frontend interface to database format
function toDbFormat(item: Omit<FridgeItem, 'id' | 'createdAt' | 'userId' | 'ownerName'>, userId: string) {
  return {
    name: item.name,
    quantity: item.quantity,
    expiry_date: item.expiryDate,
    category: item.category || '',
    location: item.location || '',
    image_url: item.imageUrl || null,
    user_id: userId,
  };
}

// Fetch usernames from profiles table for a set of user IDs
async function fetchOwnerNames(userIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const { data } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', uniqueIds);

  const map = new Map<string, string>();
  if (data) {
    for (const profile of data) {
      map.set(profile.id, profile.username);
    }
  }
  return map;
}

export const fridgeItemsApi = {
  // Fetch items - RLS handles filtering (admin sees all, user sees own)
  async getAll(): Promise<FridgeItem[]> {
    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch items: ${error.message}`);
    }

    const rows = data || [];
    const ownerNames = await fetchOwnerNames(rows.map(r => r.user_id));
    return rows.map(row => toFridgeItem(row, ownerNames.get(row.user_id)));
  },

  // Create new item
  async create(item: Omit<FridgeItem, 'id' | 'createdAt' | 'userId' | 'ownerName'>): Promise<FridgeItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('fridge_items')
      .insert(toDbFormat(item, user.id))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create item: ${error.message}`);
    }

    const ownerNames = await fetchOwnerNames([data.user_id]);
    return toFridgeItem(data, ownerNames.get(data.user_id));
  },

  // Update existing item
  async update(id: string, item: Omit<FridgeItem, 'id' | 'createdAt' | 'userId' | 'ownerName'>): Promise<FridgeItem> {
    const { data, error } = await supabase
      .from('fridge_items')
      .update({
        name: item.name,
        quantity: item.quantity,
        expiry_date: item.expiryDate,
        category: item.category || '',
        location: item.location || '',
        image_url: item.imageUrl || null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update item: ${error.message}`);
    }

    const ownerNames = await fetchOwnerNames([data.user_id]);
    return toFridgeItem(data, ownerNames.get(data.user_id));
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
