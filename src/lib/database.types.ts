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
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          role?: 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          username?: string;
          role?: 'admin' | 'user';
        };
      };
    };
  };
}

export type DbFridgeItem = Database['public']['Tables']['fridge_items']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
