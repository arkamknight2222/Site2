import { Purchase, PurchaseStatus } from './types';

const PURCHASES_KEY = 'rushWorkingPurchases';

export function getPurchases(userId: string): Purchase[] {
  try {
    const purchasesData = localStorage.getItem(PURCHASES_KEY);
    if (!purchasesData) {
      return [];
    }

    const allPurchases: Purchase[] = JSON.parse(purchasesData);
    return allPurchases.filter(purchase => purchase.userId === userId);
  } catch (error) {
    console.error('Error retrieving purchases:', error);
    return [];
  }
}

export function savePurchase(purchase: Purchase): boolean {
  try {
    const purchasesData = localStorage.getItem(PURCHASES_KEY);
    const allPurchases: Purchase[] = purchasesData ? JSON.parse(purchasesData) : [];

    allPurchases.push(purchase);
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(allPurchases));

    return true;
  } catch (error) {
    console.error('Error saving purchase:', error);
    return false;
  }
}

export function createPurchase(
  userId: string,
  pointsPurchased: number,
  amountPaid: number,
  packageName?: string
): Purchase {
  const purchase: Purchase = {
    id: `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    purchaseDate: new Date().toISOString(),
    pointsPurchased,
    amountPaid,
    paymentMethod: 'Credit Card',
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    status: 'completed',
    packageName,
  };

  return purchase;
}

export function filterPurchases(
  purchases: Purchase[],
  filters: {
    status?: PurchaseStatus;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }
): Purchase[] {
  let filtered = [...purchases];

  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }

  if (filters.startDate) {
    filtered = filtered.filter(p => new Date(p.purchaseDate) >= new Date(filters.startDate!));
  }

  if (filters.endDate) {
    filtered = filtered.filter(p => new Date(p.purchaseDate) <= new Date(filters.endDate!));
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.transactionId.toLowerCase().includes(query) ||
      p.packageName?.toLowerCase().includes(query) ||
      p.paymentMethod.toLowerCase().includes(query)
    );
  }

  return filtered;
}

export function calculatePurchaseStats(purchases: Purchase[]) {
  const totalPurchases = purchases.length;
  const totalAmountSpent = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPointsAcquired = purchases.reduce((sum, p) => sum + p.pointsPurchased, 0);
  const completedPurchases = purchases.filter(p => p.status === 'completed').length;

  return {
    totalPurchases,
    totalAmountSpent,
    totalPointsAcquired,
    completedPurchases,
  };
}

export function generateMockPurchases(userId: string): Purchase[] {
  return [
    {
      id: 'purchase-1',
      userId,
      purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      pointsPurchased: 500,
      amountPaid: 39.99,
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-2025-ABC123',
      status: 'completed',
      packageName: '500 Points Package',
    },
    {
      id: 'purchase-2',
      userId,
      purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      pointsPurchased: 100,
      amountPaid: 9.99,
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-2025-DEF456',
      status: 'completed',
      packageName: '100 Points Package',
    },
    {
      id: 'purchase-3',
      userId,
      purchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      pointsPurchased: 100,
      amountPaid: 9.99,
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-2025-GHI789',
      status: 'completed',
      packageName: '100 Points Package',
    },
  ];
}
