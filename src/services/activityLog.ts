/**
 * Lane 4 — "My Farm History" persistence layer.
 * Dual-write: localStorage (instant) + Firestore subcollection (durable).
 * Local-first reads so the timeline renders even offline.
 */

import { FarmerActivity } from '../types';

const LOCAL_KEY = 'agam_activity_log_v1';

export function readLocalActivities(farmerId: string): FarmerActivity[] {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    return all[farmerId] || [];
  } catch {
    return [];
  }
}

function writeLocalActivities(farmerId: string, list: FarmerActivity[]) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    all[farmerId] = list.slice(0, 200); // cap timeline at 200 entries
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* non-fatal */
  }
}

/** Append an activity (non-throwing; silent failure tolerated by design). */
export async function logFarmerActivity(
  farmerId: string,
  activity: Omit<FarmerActivity, 'id' | 'createdAt'>
): Promise<FarmerActivity> {
  const record: FarmerActivity = {
    ...activity,
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  // 1. Instant local write
  const current = readLocalActivities(farmerId);
  writeLocalActivities(farmerId, [record, ...current]);

  // 2. Durable Firestore write (best-effort)
  try {
    const { db, addActivityDoc } = await import('./firebase');
    if (db && addActivityDoc) {
      await addActivityDoc(farmerId, record);
    }
  } catch {
    /* Firestore offline — local copy already saved */
  }

  return record;
}

/** Full timeline: local cache first, then Firestore merge (newest first). */
export async function fetchFarmerActivities(farmerId: string): Promise<FarmerActivity[]> {
  const local = readLocalActivities(farmerId);

  try {
    const { db, fetchActivityDocs } = await import('./firebase');
    if (db && fetchActivityDocs) {
      const remote = await fetchActivityDocs(farmerId);
      // Merge by id, newest first
      const byId = new Map<string, FarmerActivity>();
      for (const item of [...local, ...(remote as FarmerActivity[])]) {
        byId.set(item.id, item);
      }
      return [...byId.values()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    /* fall through */
  }

  return local;
}
