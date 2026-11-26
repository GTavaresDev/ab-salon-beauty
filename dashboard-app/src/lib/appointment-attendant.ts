import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";

export function appointmentAttendantLabel(
  appointment: Pick<AppointmentProps, "userName">,
): string {
  if (appointment.userName) {
    return appointment.userName;
  }
  return "—";
}
