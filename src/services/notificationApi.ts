import {apiRequest, ApiError} from '@/api';
import {ApiRouteService} from '@/config/app-reference';
import {buildQueryString} from '@/services/masterApi';
import type {AppNotification, NotificationCategory} from '@/types';

// ---------------------------------------------------------------------------
// Backend response shape (raw Prisma `Notification` row — there is no
// presenter function for this endpoint server-side, unlike property.service.ts's
// presentProperty()). Only the fields this module actually consumes are typed;
// live-verified 2026-09-07 against GET /notifications, PATCH .../read and
// DELETE .../:notificationId responses (all three return this same row shape,
// aside from delete's `{ deleted: true }` and read-all's `{ readAll: true }`
// handled separately below).
// ---------------------------------------------------------------------------

interface BackendNotificationType {
  id: number;
  name: string;
}

interface BackendNotification {
  id: number | string;
  title?: string | null;
  body?: string | null;
  status?: 'PENDING' | 'SENT' | 'FAILED' | 'READ' | string | null;
  readAt?: string | null;
  createdAt?: string | null;
  type?: BackendNotificationType | null;
}

interface BackendNotificationListResponse {
  items?: BackendNotification[];
  pagination?: {page: number; limit: number; total: number; totalPages: number};
}

// ---------------------------------------------------------------------------
// Category mapping.
//
// The mock's NotificationCategory is a closed 5-value union: Properties/Legal/
// Loans/Construction/Offers. The backend's NotificationType is seeded
// (prisma/seed.ts) with exactly 8 values: System/Property/Lead/Support/Loan/
// Legal/Construction/Marketing. Four map directly by meaning (note the mock
// uses plural Properties/Loans where the backend uses singular Property/Loan):
//   Property     -> Properties
//   Legal        -> Legal
//   Loan         -> Loans
//   Construction -> Construction
//   Marketing    -> Offers   (promotional/marketing content is the closest
//                              existing analogue to the mock's "Offers" bucket)
// The remaining backend values (System, Lead, Support) have no reasonable
// equivalent in the mock's union, and so does any future/unrecognized
// type.name. All of those fall back to DEFAULT_CATEGORY ('Properties'),
// chosen because property-related notifications are this app's most common
// and most generically-relevant category — landing an unmapped notification
// there keeps it visible under a plausible bucket rather than silently
// mis-filing it under an unrelated specific category like Legal/Loans/
// Construction/Offers.
// ---------------------------------------------------------------------------

const CATEGORY_MAP: Record<string, NotificationCategory> = {
  property: 'Properties',
  legal: 'Legal',
  loan: 'Loans',
  construction: 'Construction',
  marketing: 'Offers',
};

const DEFAULT_CATEGORY: NotificationCategory = 'Properties';

function toCategory(typeName?: string | null): NotificationCategory {
  if (!typeName) {
    return DEFAULT_CATEGORY;
  }
  return CATEGORY_MAP[typeName.toLowerCase()] ?? DEFAULT_CATEGORY;
}

// "Is read" has no direct boolean field on the raw row — derived from `readAt`
// (null vs a timestamp, the primary/authoritative signal) with `status === 'READ'`
// as a secondary check for the (unobserved but schema-legal) case where a status
// might be flipped to READ without readAt being populated.
function toIsRead(raw: BackendNotification): boolean {
  return Boolean(raw.readAt) || raw.status === 'READ';
}

function normalizeNotification(raw: BackendNotification): AppNotification {
  return {
    id: String(raw.id),
    title: raw.title ?? '',
    message: raw.body ?? '',
    category: toCategory(raw.type?.name),
    isRead: toIsRead(raw),
    createdAt: raw.createdAt ?? '',
  };
}

export interface NotificationQueryParams {
  isRead?: boolean;
  module?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export async function getNotifications(
  params?: NotificationQueryParams,
): Promise<AppNotification[]> {
  const endpoint = `${ApiRouteService.notifications.list}${buildQueryString(params)}`;

  const response = await apiRequest<BackendNotificationListResponse>({
    endpoint,
    method: 'GET',
    auth: 'access',
  });

  return (response.items ?? []).map(normalizeNotification);
}

// PATCH .../read requires a genuinely empty body (live-verified: any field, even
// an unrelated one, is rejected with 422 "Request body must be empty" per
// emptyBodySchema) — no `body` key is passed to apiRequest at all, matching the
// established pattern for other empty-body endpoints (see propertyApi.ts's
// recordPropertyView).
export async function markNotificationRead(
  notificationId: string,
): Promise<AppNotification | undefined> {
  const endpoint = ApiRouteService.notifications.markRead.replace(
    ':notificationId',
    notificationId,
  );

  try {
    const response = await apiRequest<BackendNotification>({
      endpoint,
      method: 'PATCH',
      auth: 'access',
    });
    return normalizeNotification(response);
  } catch (error) {
    // Same missing-resource-is-not-exceptional reasoning as propertyApi.ts's
    // getPropertyById/updateProperty: a 404 resolves to `undefined` rather than
    // rejecting, matching the mock's `.find(...)`-based not-found contract.
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// PATCH /notifications/read-all responds with `{ readAll: true }`, not the
// updated notification list — a shape mismatch against the mock's
// `markAllNotificationsRead(): Promise<AppNotification[]>` signature. The
// signature is preserved (screen/store are out of scope for this change) by
// re-fetching the fresh list via getNotifications() after a successful mark-all,
// rather than trying to reconstruct it client-side from a boolean flag.
export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  await apiRequest<{readAll: boolean}>({
    endpoint: ApiRouteService.notifications.markAllRead,
    method: 'PATCH',
    auth: 'access',
  });

  return getNotifications();
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const endpoint = ApiRouteService.notifications.delete.replace(
    ':notificationId',
    notificationId,
  );

  try {
    await apiRequest<unknown>({
      endpoint,
      method: 'DELETE',
      auth: 'access',
    });
    return true;
  } catch (error) {
    // A 404 (already deleted / never existed) resolves to `false` rather than
    // rejecting, mirroring propertyApi.ts's deleteProperty. This endpoint is
    // properly guarded server-side (live-verified clean 404, no 500 crash on a
    // bad id), so no extra special-casing is needed beyond this standard check.
    if (error instanceof ApiError && error.status === 404) {
      return false;
    }
    throw error;
  }
}
