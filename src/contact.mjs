// Confirmed company WhatsApp (2026-09-08). The conversation link omits the extra
// mobile digit; the full phone number is kept in legal/support contact blocks.
export const ORIGIN = "https://tetelestai.tech";
export const WHATSAPP_NUMBER = "556184711930";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = "https://www.instagram.com/tetelestai.tech/";
// Kiwify checkout for the Essencial guide, supplied by Carlos.
export const CHECKOUT_ESSENCIAL = "https://pay.kiwify.com.br/CVpvQ3c";

// A ready-made first message tells the team which page the visitor came from.
// It is only a prefilled draft: the visitor still decides whether to send it.
export function whatsappHref(message) {
  // Apostrophes are encoded too, so the URL stays intact in any HTML attribute.
  return message ? `${WHATSAPP_LINK}?text=${encodeURIComponent(message).replaceAll("'", "%27")}` : WHATSAPP_LINK;
}
