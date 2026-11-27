import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentSessionAction, logoutAction } from "@core/application/query/controller/users/auth.controller";
import { useAppShellStore } from "./app-shell.store";

vi.mock("@core/application/query/controller/users/auth.controller", () => ({
  getCurrentSessionAction: vi.fn(),
  logoutAction: vi.fn(),
}));
vi.mock("@/app/(agendamentos)/(left-nav-bar)/dashboard/lib/pending-notification-storage", () => ({
  resetPendingNotificationDismissed: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  useAppShellStore.setState(useAppShellStore.getInitialState());
});

describe("inicialização do painel", () => {
  it("encerra a sessão rejeitada antes de navegar ao login", async () => {
    vi.mocked(getCurrentSessionAction).mockResolvedValue(null);
    await useAppShellStore.getState().bootstrap();
    expect(logoutAction).toHaveBeenCalledTimes(1);
  });

  it("mantém uma sessão validada pelo servidor", async () => {
    const user = { id: "gestor", name: "Gestor", email: "gestor@example.com", role: "Gestor", permissionLevel: 2, initials: "G" } as const;
    vi.mocked(getCurrentSessionAction).mockResolvedValue(user);
    await useAppShellStore.getState().bootstrap();
    expect(useAppShellStore.getState().currentUser).toBe(user);
    expect(useAppShellStore.getState().isBootstrapping).toBe(false);
    expect(logoutAction).not.toHaveBeenCalled();
  });
});
