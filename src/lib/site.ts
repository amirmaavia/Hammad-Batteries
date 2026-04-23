export const DISPLAY_PHONE_NUMBER = "03162900269";
export const WHATSAPP_PHONE_NUMBER = "923162900269";

export function getWhatsAppLink(message?: string) {
  const baseUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}`;

  if (!message) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
