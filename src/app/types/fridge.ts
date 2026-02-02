export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  location: string;
  userId: string;
  ownerName?: string;
  createdAt: string;
}

export type NotificationStatus = 'expired' | 'expiring-soon' | 'fresh';
