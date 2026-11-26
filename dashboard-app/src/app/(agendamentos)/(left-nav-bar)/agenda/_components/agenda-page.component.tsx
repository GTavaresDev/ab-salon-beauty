"use client";

import { useAgendaPage } from "../hooks/use-agenda-page";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons.component";
import { AgendaView } from "@/app/(agendamentos)/(left-nav-bar)/agenda/_components/agenda-view.component";
import { CreateAppointmentDialog } from "@/app/(agendamentos)/(left-nav-bar)/agenda/_components/create-appointment-dialog.component";

export function AgendaPage() {
  const {
    currentUser,
    showToast,
    appointmentList,
    appointmentsLoading,
    handleAppointmentStatusChange,
    userList,
    usersLoading,
    clientsLoading,
    servicesLoading,
    modal,
    setModal,
  } = useAgendaPage();

  if (!currentUser) return null;

  if (appointmentsLoading || usersLoading || clientsLoading || servicesLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="agenda" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <>
      <AgendaView
        appointments={appointmentList}
        onStatusChange={handleAppointmentStatusChange}
        onNew={() => setModal(true)}
        showToast={showToast}
        currentUserRole={currentUser.role}
        currentUserName={currentUser.name}
        currentUserId={currentUser.id}
        userList={userList}
      />
      {modal && (
        <CreateAppointmentDialog
          appointments={appointmentList}
          onClose={() => setModal(false)}
          showToast={showToast}
        />
      )}
    </>
  );
}
