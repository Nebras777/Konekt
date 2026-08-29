import type { DaySummary } from '../src/constants/types';

/**
 * Hands an unsent DaySummary draft from building.tsx to the recap review
 * screen without round-tripping through Firestore (there's nothing to fetch
 * until the user presses Send). In-memory only — a reload loses pending
 * drafts, which is fine since they haven't been sent yet.
 */
const drafts = new Map<string, DaySummary>();

export function setDraftRecap(summary: DaySummary): void {
  drafts.set(summary.id, summary);
}

export function getDraftRecap(id: string): DaySummary | undefined {
  return drafts.get(id);
}

export function clearDraftRecap(id: string): void {
  drafts.delete(id);
}
