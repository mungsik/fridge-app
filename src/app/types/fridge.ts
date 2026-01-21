export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  location: string;
  createdAt: string;
}

export type NotificationStatus = 'expired' | 'expiring-soon' | 'fresh';
