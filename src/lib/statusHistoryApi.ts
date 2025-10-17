import { supabase } from './supabase';
import { ApplicationStatus } from './mockData';

export interface StatusHistoryEntry {
  id: string;
  application_id: string;
  old_status: ApplicationStatus;
  new_status: ApplicationStatus;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
}

export async function recordStatusChange(
  applicationId: string,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('status_history')
      .insert({
        application_id: applicationId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: user?.id || null,
        notes: notes || null,
        changed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording status change:', error);
      recordStatusChangeToLocalStorage(applicationId, oldStatus, newStatus);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error recording status change:', err);
    recordStatusChangeToLocalStorage(applicationId, oldStatus, newStatus);
    return { success: false, error: 'Failed to record status change' };
  }
}

export async function getStatusHistory(applicationId: string): Promise<StatusHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Error fetching status history:', error);
      return getStatusHistoryFromLocalStorage(applicationId);
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching status history:', err);
    return getStatusHistoryFromLocalStorage(applicationId);
  }
}

function recordStatusChangeToLocalStorage(
  applicationId: string,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): void {
  try {
    const key = `status_history_${applicationId}`;
    const existing = localStorage.getItem(key);
    const history: StatusHistoryEntry[] = existing ? JSON.parse(existing) : [];

    history.push({
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      application_id: applicationId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_at: new Date().toISOString(),
      changed_by: null,
      notes: null
    });

    localStorage.setItem(key, JSON.stringify(history));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

function getStatusHistoryFromLocalStorage(applicationId: string): StatusHistoryEntry[] {
  try {
    const key = `status_history_${applicationId}`;
    const existing = localStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch (err) {
    console.error('Error reading from localStorage:', err);
    return [];
  }
}
