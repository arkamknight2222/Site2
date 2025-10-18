export interface PointsHistoryEntry {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: string;
  category: 'application' | 'boost' | 'bonus' | 'event' | 'purchase' | 'refund';
  userId?: string;
}

const POINTS_HISTORY_KEY = 'rushWorking_pointsHistory';

export function getPointsHistory(userId?: string): PointsHistoryEntry[] {
  try {
    const data = localStorage.getItem(POINTS_HISTORY_KEY);
    const allHistory: PointsHistoryEntry[] = data ? JSON.parse(data) : [];

    if (userId) {
      return allHistory.filter(entry => entry.userId === userId);
    }

    return allHistory;
  } catch (error) {
    console.error('Error reading points history:', error);
    return [];
  }
}

export function addPointsHistoryEntry(entry: Omit<PointsHistoryEntry, 'id' | 'date'>): void {
  try {
    const history = getPointsHistory();
    const newEntry: PointsHistoryEntry = {
      ...entry,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    };

    history.unshift(newEntry);
    localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding points history entry:', error);
  }
}

export function clearPointsHistory(userId?: string): void {
  try {
    if (userId) {
      const allHistory = getPointsHistory();
      const filtered = allHistory.filter(entry => entry.userId !== userId);
      localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(filtered));
    } else {
      localStorage.removeItem(POINTS_HISTORY_KEY);
    }
  } catch (error) {
    console.error('Error clearing points history:', error);
  }
}

export function getPointsStats(userId?: string): { totalEarned: number; totalSpent: number } {
  const history = getPointsHistory(userId);

  const totalEarned = history
    .filter(entry => entry.type === 'earned')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalSpent = Math.abs(history
    .filter(entry => entry.type === 'spent')
    .reduce((sum, entry) => sum + entry.amount, 0));

  return { totalEarned, totalSpent };
}
