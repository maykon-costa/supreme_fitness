/**
 * CTA de WhatsApp — LP_GUIDE §3
 * `origem` é obrigatório: sem ela você não sabe qual seção converte.
 */
export function handleWhatsAppClick(origem = "site", mensagemCustom) {
  const phone = import.meta.env.VITE_WHATSAPP_PHONE;
  const message = mensagemCustom || import.meta.env.VITE_WHATSAPP_MESSAGE;

  window.dataLayer?.push({ event: "click_whatsapp", origem });

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Mensagem pré-preenchida por plano, para o cliente saber a origem do lead. */
export function mensagemPlano(nomePlano) {
  return `Olá! Tenho interesse no plano ${nomePlano} da Supreme Fitness. Pode me passar mais informações?`;
}
