export const PENDING_NOTIF_SESSION_KEY = "agendamentos.pending_notification_dismissed";

export function isPendingNotificationDismissed(): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) return false;
  try {
    return window.sessionStorage.getItem(PENDING_NOTIF_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function dismissPendingNotification(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(PENDING_NOTIF_SESSION_KEY, "true");
  } catch {
    // ignore
  }
}

export function resetPendingNotificationDismissed(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(PENDING_NOTIF_SESSION_KEY);
  } catch {
    // ignore
  }
}
