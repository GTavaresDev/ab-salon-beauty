"use client";

import { type ReactNode } from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useScrollLock } from "@/lib/use-scroll-lock";
import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  ListChecks,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { canAccessReports, canAccessUsers } from "@/lib/permissions";
import { useAppShell } from "@/stores/app-shell.store";

export function useShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    mobileOpen,
    setMobileOpen,
    toast,
    handleStopImpersonation,
    handleLogout,
    setInitialEditUserId,
    pageHeader,
  } = useAppShell();

  const [impersonatingLoading, setImpersonatingLoading] = useState(false);

  useScrollLock(mobileOpen);

  const isAdmin =
    currentUser?.permissionLevel === 1 || currentUser?.role === "Administrador";

  const isFuncionario =
    currentUser?.permissionLevel === 3 || currentUser?.role === "Funcionario";

  const allNav = [
    {
      id: "dashboard",
      label: "Início",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: CalendarDays,
      href: "/agenda",
    },
    {
      id: "servicos",
      label: "Serviços",
      icon: Sparkles,
      href: "/servicos",
    },
    {
      id: "clientes",
      label: "Clientes",
      icon: UserCheck,
      href: "/clientes",
    },
    {
      id: "usuarios",
      label: "Funcionários",
      icon: UsersRound,
      href: "/usuarios",
      restricted: true,
    },
    {
      id: "servicos-por-funcionario",
      label: "Serviços por Profissional",
      icon: ListChecks,
      href: "/servicos-por-funcionario",
    },
    {
      id: "vendas",
      label: "Vendas",
      icon: ShoppingCart,
      href: "/vendas",
    },
    {
      id: "produtos",
      label: "Produtos",
      icon: Package,
      href: "/produtos",
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: ChartNoAxesCombined,
      href: "/relatorios",
      restricted: true,
    },
    {
      id: "comissao",
      label: "Comissão",
      icon: CircleDollarSign,
      href: "/comissao",
    },
    ...(process.env.NODE_ENV === "development" ? [{
      id: "configuracoes",
      label: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      adminOnly: true,
    }] : []),
  ];

  const hasReportsPermission = canAccessReports(currentUser);
  const hasUsersPermission = canAccessUsers(currentUser);

  const nav = allNav.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.id === "usuarios" && !hasUsersPermission) return false;
    if (item.id === "servicos-por-funcionario" && currentUser?.role !== "Gestor" && currentUser?.role !== "Administrador") return false;
    if (item.id === "relatorios" && !hasReportsPermission) return false;
    if (item.id === "clientes" && isFuncionario) return false;
    if (item.id === "comissao" && isFuncionario) return false;
    if (item.id === "produtos" && isFuncionario) return false;
    return true;
  });

  async function onStopImpersonation() {
    setImpersonatingLoading(true);
    try {
      await handleStopImpersonation();
    } finally {
      setImpersonatingLoading(false);
    }
  }

  const firstName = currentUser?.name?.split(" ")[0] || "usuário";

  const getPageHeader = () => {
    if (pathname.includes("/servicos-por-funcionario")) {
      return { title: "Serviços por Profissional", subtitle: "Defina os serviços realizados por funcionários e gestores." };
    }
    if (pathname.includes("/agenda")) {
      return { title: "Agenda Completa", subtitle: "Acompanhe e gerencie todos os compromissos do dia." };
    }
    if (pathname.includes("/servicos")) {
      return { title: "Serviços", subtitle: "Gerencie os serviços cadastrados no banco de dados para agendamentos." };
    }
    if (pathname.includes("/clientes")) {
      return { title: "Clientes", subtitle: "Gerencie a base de clientes cadastrados." };
    }
    if (pathname.includes("/usuarios")) {
      return { title: "Usuários", subtitle: "Gerencie sua base de usuários e equipe." };
    }
    if (pathname.includes("/vendas")) {
      return { title: "Caixa (Vendas)", subtitle: "Registre vendas e gerencie o estoque em tempo real." };
    }
    if (pathname.includes("/produtos")) {
      return { title: "Produtos", subtitle: "Cadastre e gerencie os produtos do seu negócio." };
    }
    if (pathname.includes("/relatorios")) {
      return { title: "Relatórios", subtitle: "Dados consolidados para acompanhar a operação." };
    }
    if (pathname.includes("/comissao")) {
      return { title: "Comissão", subtitle: "Audite os atendimentos concluídos e acompanhe as comissões da equipe." };
    }
    if (process.env.NODE_ENV === "development" && pathname.includes("/configuracoes")) {
      return { title: "Configurações", subtitle: "Gerencie preferências e recursos do sistema." };
    }
    return {
      title: `Olá, ${firstName}!`,
      subtitle:
        "Visão Geral dos Agendamentos — Acompanhe o ritmo dos atendimentos e os indicadores principais do seu estabelecimento.",
    };
  };

  const { title, subtitle } = pathname.includes("/agenda") && pageHeader
    ? pageHeader
    : getPageHeader();

  function handleOpenSelfEdit() {
    if (!isFuncionario && currentUser) {
      setInitialEditUserId(currentUser.id);
      router.push("/usuarios");
    }
  }
  return {
    pathname,
    currentUser,
    mobileOpen,
    setMobileOpen,
    toast,
    handleLogout,
    impersonatingLoading,
    isFuncionario,
    nav,
    onStopImpersonation,
    title,
    subtitle,
    handleOpenSelfEdit,
  };
}
