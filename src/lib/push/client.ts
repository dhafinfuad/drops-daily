import type { AppMetaRecord } from "$lib/db/schema";
import type { ReminderPlan } from "$lib/reminders/engine";

export interface PushCapability {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  standalone: boolean;
}

export type PushStateReason =
  | "active"
  | "unsupported"
  | "permission_not_granted"
  | "service_worker_missing"
  | "subscription_missing";

export interface ReconciledPushState {
  active: boolean;
  reason: PushStateReason;
  capability: PushCapability;
}

export class PushSyncError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "registration_missing"
      | "subscription_missing"
      | "permission_not_granted"
      | "network"
      | "server",
    public readonly status?: number
  ) {
    super(message);
    this.name = "PushSyncError";
  }
}

function base64UrlToArrayBuffer(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);

  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }

  return buffer;
}

export function getPushCapability(): PushCapability {
  const supported =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  if (!supported) {
    return {
      supported: false,
      permission: "unsupported",
      standalone: false
    };
  }

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  return {
    supported: true,
    permission: Notification.permission,
    standalone
  };
}

async function getPublicVapidKey(): Promise<string> {
  const response = await fetch("/.netlify/functions/push-public-key", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new PushSyncError(
      "VAPID belum dikonfigurasi pada server.",
      "server",
      response.status
    );
  }

  const body = await response.json();
  return body.publicKey;
}

async function postSubscription(
  meta: AppMetaRecord,
  subscription: PushSubscription
) {
  let response: Response;

  try {
    response = await fetch("/.netlify/functions/push-subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceId: meta.installId,
        deviceSecret: meta.pushAuthSecret,
        subscription: subscription.toJSON()
      })
    });
  } catch {
    throw new PushSyncError(
      "Tidak dapat terhubung ke layanan notifikasi.",
      "network"
    );
  }

  if (!response.ok) {
    throw new PushSyncError(
      "Registrasi Web Push gagal.",
      "server",
      response.status
    );
  }
}

export async function reconcilePushState(
  meta: AppMetaRecord
): Promise<ReconciledPushState> {
  const capability = getPushCapability();

  if (!capability.supported) {
    return { active: false, reason: "unsupported", capability };
  }

  if (capability.permission !== "granted") {
    return {
      active: false,
      reason: "permission_not_granted",
      capability
    };
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return {
      active: false,
      reason: "service_worker_missing",
      capability
    };
  }

  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return {
      active: false,
      reason: "subscription_missing",
      capability
    };
  }

  return { active: true, reason: "active", capability };
}

/**
 * Re-registers an already-existing browser subscription with our server.
 * This does not request permission and does not create a new subscription,
 * so it is safe to use as automatic recovery after the server record is lost.
 */
export async function registerExistingPushSubscription(meta: AppMetaRecord) {
  const capability = getPushCapability();

  if (!capability.supported || capability.permission !== "granted") {
    throw new PushSyncError(
      "Izin notifikasi tidak aktif.",
      "permission_not_granted"
    );
  }

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();

  if (!subscription) {
    throw new PushSyncError(
      "Subscription notifikasi tidak ditemukan.",
      "subscription_missing"
    );
  }

  await postSubscription(meta, subscription);
}

export async function enablePush(meta: AppMetaRecord) {
  const capability = getPushCapability();

  if (!capability.supported) {
    throw new Error("Browser ini belum mendukung Web Push.");
  }

  const existingRegistration = await navigator.serviceWorker.getRegistration();

  if (!existingRegistration) {
    throw new Error(
      "Service Worker belum aktif. Web Push diuji melalui build production/Netlify, bukan npm run dev biasa."
    );
  }

  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(`Izin notifikasi: ${permission}.`);
  }

  const publicKey = await getPublicVapidKey();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToArrayBuffer(publicKey)
    });
  }

  await postSubscription(meta, subscription);
}

export async function syncPushSchedule(
  meta: AppMetaRecord,
  revision: number,
  plan: ReminderPlan
) {
  let response: Response;

  try {
    response = await fetch("/.netlify/functions/push-schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceId: meta.installId,
        deviceSecret: meta.pushAuthSecret,
        revision,
        reminders: plan.reminders.map((item) => ({
          id: item.id,
          at: item.at.toISOString(),
          amountMl: item.amountMl
        }))
      })
    });
  } catch {
    throw new PushSyncError(
      "Sinkronisasi jadwal push gagal karena jaringan.",
      "network"
    );
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new PushSyncError(
        "Registrasi Web Push di server tidak ditemukan.",
        "registration_missing",
        403
      );
    }

    throw new PushSyncError(
      "Sinkronisasi jadwal push gagal.",
      "server",
      response.status
    );
  }
}

export async function disablePush(meta: AppMetaRecord) {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();

  try {
    await subscription?.unsubscribe();
  } catch {
    // Local UI should still be allowed to turn reminders off.
  }

  try {
    await fetch("/.netlify/functions/push-unsubscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceId: meta.installId,
        deviceSecret: meta.pushAuthSecret
      })
    });
  } catch {
    // If offline, the old server subscription will eventually return
    // 404/410 from the push service and be cleaned by the dispatcher.
  }
}
