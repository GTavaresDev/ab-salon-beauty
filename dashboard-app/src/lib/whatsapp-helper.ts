export interface AppointmentWhatsAppParams {
  phone?: string | null;
  clientName?: string | null;
  date: string;
  time: string;
  professionalName?: string | null;
  serviceName?: string | null;
}

/**
 * Normaliza o número de telefone para o padrão do WhatsApp internacional (wa.me/55...).
 * Se o número brasileiro possuir 10 ou 11 dígitos, adiciona o DDI 55.
 */
export function formatWhatsAppPhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  // Se já tiver DDI 55 e tamanho de celular/fixo (12 ou 13 dígitos)
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Se tem DDD + número (10 ou 11 dígitos), prefixa 55 (Brasil)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Converte data ISO (yyyy-mm-dd) para formato brasileiro (dd/mm/yyyy).
 */
export function formatWhatsAppDate(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }
  return isoDate;
}

/**
 * Monta o texto de notificação de confirmação do agendamento.
 */
export function buildAppointmentConfirmationMessage(params: AppointmentWhatsAppParams): string {
  const greeting = params.clientName?.trim()
    ? `Olá, ${params.clientName.trim()}! Seu agendamento em ${formatWhatsAppDate(params.date)} às ${params.time} foi confirmado.`
    : `Olá! Seu agendamento em ${formatWhatsAppDate(params.date)} às ${params.time} foi confirmado.`;

  const professional = params.professionalName?.trim() || "Equipe da clínica";

  const lines = [
    greeting,
    "",
    `Serviço: ${params.serviceName?.trim() || "Não informado"}`,
    `Profissional: ${professional}`,
  ];

  return lines.join("\n");
}

export function buildAppointmentCancellationMessage(params: AppointmentWhatsAppParams): string {
  const greeting = params.clientName?.trim()
    ? `Olá, ${params.clientName.trim()}! Informamos que seu horário de ${formatWhatsAppDate(params.date)} às ${params.time} foi cancelado.`
    : `Olá! Informamos que seu horário de ${formatWhatsAppDate(params.date)} às ${params.time} foi cancelado.`;
  const lines = [
    greeting,
    "",
    `Serviço: ${params.serviceName?.trim() || "Não informado"}`,
    `Profissional: ${params.professionalName?.trim() || "Equipe da clínica"}`,
  ];
  return lines.join("\n");
}

export function buildAppointmentCancellationWhatsAppUrl(params: AppointmentWhatsAppParams): string {
  const phoneDigits = formatWhatsAppPhone(params.phone);
  const encodedText = encodeURIComponent(buildAppointmentCancellationMessage(params));
  return phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}

export function openWhatsAppCancellation(params: AppointmentWhatsAppParams): void {
  if (typeof window === "undefined") return;
  window.open(buildAppointmentCancellationWhatsAppUrl(params), "_blank", "noopener,noreferrer");
}

/**
 * Gera a URL do WhatsApp com o link wa.me e a mensagem codificada.
 */
export function buildAppointmentWhatsAppUrl(params: AppointmentWhatsAppParams): string {
  const phoneDigits = formatWhatsAppPhone(params.phone);
  const message = buildAppointmentConfirmationMessage(params);
  const encodedText = encodeURIComponent(message);

  if (phoneDigits) {
    return `https://wa.me/${phoneDigits}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Abre a URL do WhatsApp em uma nova aba do navegador.
 */
export function openWhatsAppConfirmation(params: AppointmentWhatsAppParams): void {
  if (typeof window === "undefined") return;
  const url = buildAppointmentWhatsAppUrl(params);
  window.open(url, "_blank", "noopener,noreferrer");
}
