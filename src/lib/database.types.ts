export interface Database {
  public: {
    Tables: {
      fridge_items: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          expiry_date: string;
          category: string;
          location: string;
          user_id: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          quantity?: number;
          expiry_date: string;
          category?: string;
          location?: string;
          user_id: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          quantity?: number;
          expiry_date?: string;
          category?: string;
          location?: string;
          image_url?: string | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          role: 'admin' | 'user';
          created_at: string;
          telegram_chat_id: string | null;
          telegram_link_code: string | null;
          telegram_linked_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          role?: 'admin' | 'user';
          created_at?: string;
          telegram_chat_id?: string | null;
          telegram_link_code?: string | null;
          telegram_linked_at?: string | null;
        };
        Update: {
          username?: string;
          role?: 'admin' | 'user';
          telegram_chat_id?: string | null;
          telegram_link_code?: string | null;
          telegram_linked_at?: string | null;
        };
      };
    };
  };
}

export type DbFridgeItem = Database['public']['Tables']['fridge_items']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
