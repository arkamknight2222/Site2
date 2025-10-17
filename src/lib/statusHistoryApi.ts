import { ApplicationStatus } from './types';

const STATUS_HISTORY_KEY = 'rushWorking_statusHistory';

export interface StatusHistoryEntry {
  id: string;
  application_id: string;
  old_status: ApplicationStatus;
  new_status: ApplicationStatus;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
}

interface StatusHistoryStore {
  [applicationId: string]: StatusHistoryEntry[];
}

function getAllStatusHistory(): StatusHistoryStore {
  try {
    const data = localStorage.getItem(STATUS_HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('Error reading status history from localStorage:', err);
    return {};
  }
}

function saveAllStatusHistory(history: StatusHistoryStore): void {
  try {
    localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Error saving status history to localStorage:', err);
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Consider clearing old data.');
    }
  }
}

export function recordStatusChange(
  applicationId: string,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  notes?: string
): { success: boolean; error?: string } {
  try {
    const allHistory = getAllStatusHistory();

    if (!allHistory[applicationId]) {
      allHistory[applicationId] = [];
    }

    const newEntry: StatusHistoryEntry = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      application_id: applicationId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_at: new Date().toISOString(),
      changed_by: null,
      notes: notes || null
    };

    allHistory[applicationId].push(newEntry);
    saveAllStatusHistory(allHistory);

    return { success: true };
  } catch (err) {
    console.error('Error recording status change:', err);
    return { success: false, error: 'Failed to record status change' };
  }
}

export function getStatusHistory(applicationId: string): StatusHistoryEntry[] {
  try {
    const allHistory = getAllStatusHistory();
    const history = allHistory[applicationId] || [];

    return history.sort((a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );
  } catch (err) {
    console.error('Error fetching status history:', err);
    return [];
  }
}

export function clearStatusHistory(applicationId?: string): void {
  try {
    if (applicationId) {
      const allHistory = getAllStatusHistory();
      delete allHistory[applicationId];
      saveAllStatusHistory(allHistory);
    } else {
      localStorage.removeItem(STATUS_HISTORY_KEY);
    }
  } catch (err) {
    console.error('Error clearing status history:', err);
  }
}

export function exportStatusHistory(): StatusHistoryStore {
  return getAllStatusHistory();
}

export function importStatusHistory(history: StatusHistoryStore): boolean {
  try {
    saveAllStatusHistory(history);
    return true;
  } catch (err) {
    console.error('Error importing status history:', err);
    return false;
  }
}
