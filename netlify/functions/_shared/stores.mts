import { getStore } from "@netlify/blobs";

export interface PushDeviceRecord {
  deviceId: string;
  secretHash: string;
  subscription: {
    endpoint: string;
    expirationTime?: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  revision: number;
  active: boolean;
  updatedAt: number;
}

export interface PushReminderRecord {
  deviceId: string;
  revision: number;
  reminderId: string;
  at: string;
  amountMl: number;
}

export function getDeviceStore() {
  return getStore({
    name: "push-devices",
    consistency: "strong"
  });
}

export function getReminderStore() {
  return getStore({
    name: "push-reminders",
    consistency: "strong"
  });
}


export function getDispatchClaimStore() {
  return getStore({
    name: "push-dispatch-claims",
    consistency: "strong"
  });
}
