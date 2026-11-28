import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import type { ClientProps } from "@core/application/query/interface/client.entity";

export function getContactSuggestions(clients: ClientProps[], appointments: AppointmentProps[], now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return clients.flatMap((client) => {
    if (!client.id || client.status !== "Ativo") return [];
    const visits = appointments.filter((appointment) => appointment.clientId === client.id && appointment.status !== "Cancelado");
    if (visits.some((appointment) => Date.parse(`${appointment.date}T${appointment.time}:00`) >= now.getTime())) return [];
    const past = visits.filter((appointment) => Date.parse(`${appointment.date}T${appointment.time}:00`) < now.getTime());
    if (!past.length) return [];
    const latest = past.reduce((a, b) => `${a.date}T${a.time}` > `${b.date}T${b.time}` ? a : b);
    const [year, month, day] = latest.date.split("-").map(Number);
    if ((today - Date.UTC(year, month - 1, day)) / 86_400_000 <= 60) return [];
    return [{ client, lastVisit: latest.date }];
  });
}

export function contactWhatsAppUrl(phone: string, name: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const message = `Olá, ${name}! Tudo bem? Sentimos sua falta e gostaríamos de saber se deseja agendar uma nova visita.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
