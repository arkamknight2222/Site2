export interface SwipeAction {
  jobId: string;
  actionType: 'ignored' | 'saved' | 'applied' | 'blocked';
  timestamp: number;
  userId?: string;
}

const SWIPE_ACTIONS_KEY = 'rushWorking_swipeActions';
const SAVED_JOBS_KEY = 'rushWorking_savedJobs';
const BLOCKED_JOBS_KEY = 'rushWorking_blockedJobs';
const IGNORED_JOBS_KEY = 'rushWorking_ignoredJobs';
const APPLIED_JOBS_KEY = 'rushWorking_appliedJobs';

export function getSwipeActions(): SwipeAction[] {
  try {
    const data = localStorage.getItem(SWIPE_ACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading swipe actions:', error);
    return [];
  }
}

export function addSwipeAction(action: SwipeAction): void {
  try {
    const actions = getSwipeActions();
    actions.push(action);
    localStorage.setItem(SWIPE_ACTIONS_KEY, JSON.stringify(actions));

    switch (action.actionType) {
      case 'saved':
        addToList(SAVED_JOBS_KEY, action.jobId);
        break;
      case 'blocked':
        addToList(BLOCKED_JOBS_KEY, action.jobId);
        break;
      case 'ignored':
        addToList(IGNORED_JOBS_KEY, action.jobId);
        break;
      case 'applied':
        addToList(APPLIED_JOBS_KEY, action.jobId);
        break;
    }
  } catch (error) {
    console.error('Error adding swipe action:', error);
  }
}

export function removeSwipeAction(jobId: string, actionType: string): void {
  try {
    const actions = getSwipeActions();
    const filtered = actions.filter(a => !(a.jobId === jobId && a.actionType === actionType));
    localStorage.setItem(SWIPE_ACTIONS_KEY, JSON.stringify(filtered));

    const keyMap: Record<string, string> = {
      saved: SAVED_JOBS_KEY,
      blocked: BLOCKED_JOBS_KEY,
      ignored: IGNORED_JOBS_KEY,
      applied: APPLIED_JOBS_KEY,
    };

    const key = keyMap[actionType];
    if (key) {
      removeFromList(key, jobId);
    }
  } catch (error) {
    console.error('Error removing swipe action:', error);
  }
}

function addToList(key: string, jobId: string): void {
  try {
    const data = localStorage.getItem(key);
    const list: string[] = data ? JSON.parse(data) : [];
    if (!list.includes(jobId)) {
      list.push(jobId);
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch (error) {
    console.error(`Error adding to ${key}:`, error);
  }
}

function removeFromList(key: string, jobId: string): void {
  try {
    const data = localStorage.getItem(key);
    const list: string[] = data ? JSON.parse(data) : [];
    const filtered = list.filter(id => id !== jobId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error(`Error removing from ${key}:`, error);
  }
}

export function getSavedJobs(): string[] {
  try {
    const data = localStorage.getItem(SAVED_JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading saved jobs:', error);
    return [];
  }
}

export function getBlockedJobs(): string[] {
  try {
    const data = localStorage.getItem(BLOCKED_JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading blocked jobs:', error);
    return [];
  }
}

export function getIgnoredJobs(): string[] {
  try {
    const data = localStorage.getItem(IGNORED_JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading ignored jobs:', error);
    return [];
  }
}

export function getAppliedJobs(): string[] {
  try {
    const data = localStorage.getItem(APPLIED_JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading applied jobs:', error);
    return [];
  }
}

export function clearIgnoredHistory(): void {
  try {
    localStorage.setItem(IGNORED_JOBS_KEY, JSON.stringify([]));
    const actions = getSwipeActions();
    const filtered = actions.filter(a => a.actionType !== 'ignored');
    localStorage.setItem(SWIPE_ACTIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error clearing ignored history:', error);
  }
}

export function unblockJob(jobId: string): void {
  removeSwipeAction(jobId, 'blocked');
}

export function blockJob(jobId: string): void {
  addSwipeAction({
    jobId,
    actionType: 'blocked',
    timestamp: Date.now(),
  });
}

export function isJobBlocked(jobId: string): boolean {
  return getBlockedJobs().includes(jobId);
}

export function isJobSaved(jobId: string): boolean {
  return getSavedJobs().includes(jobId);
}

export function isJobApplied(jobId: string): boolean {
  return getAppliedJobs().includes(jobId);
}

export function isJobIgnored(jobId: string): boolean {
  return getIgnoredJobs().includes(jobId);
}
