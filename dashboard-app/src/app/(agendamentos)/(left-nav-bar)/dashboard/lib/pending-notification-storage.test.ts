import { describe, it, expect, beforeEach } from "vitest";
import {
  isPendingNotificationDismissed,
  dismissPendingNotification,
  resetPendingNotificationDismissed,
  PENDING_NOTIF_SESSION_KEY,
} from "./pending-notification-storage";

describe("Pending Notification Storage", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockSessionStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    Object.defineProperty(globalThis, "window", {
      value: {
        sessionStorage: mockSessionStorage,
      },
      writable: true,
      configurable: true,
    });
  });

  it("should return false when notification has not been dismissed", () => {
    expect(isPendingNotificationDismissed()).toBe(false);
  });

  it("should return true after dismissing notification", () => {
    dismissPendingNotification();
    expect(store[PENDING_NOTIF_SESSION_KEY]).toBe("true");
    expect(isPendingNotificationDismissed()).toBe(true);
  });

  it("should reset dismissed state when reset is called", () => {
    dismissPendingNotification();
    expect(isPendingNotificationDismissed()).toBe(true);

    resetPendingNotificationDismissed();
    expect(store[PENDING_NOTIF_SESSION_KEY]).toBeUndefined();
    expect(isPendingNotificationDismissed()).toBe(false);
  });
});
