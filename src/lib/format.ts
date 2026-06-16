import { format } from "date-fns";
import { pt } from "date-fns/locale";

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: pt });
  } catch (e) {
    return dateString;
  }
}

export function formatRole(role: string): string {
  switch (role) {
    case "admin": return "Administrador";
    case "colaborador": return "Colaborador";
    case "auditor": return "Auditor";
    default: return role;
  }
}

export function formatStatus(status: string): string {
  switch (status) {
    case "ativo": return "Ativo";
    case "obsoleto": return "Obsoleto";
    case "revisao": return "Em Revisão";
    default: return status;
  }
}
