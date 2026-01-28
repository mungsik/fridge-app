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
    };
  };
}

export type DbFridgeItem = Database['public']['Tables']['fridge_items']['Row'];
