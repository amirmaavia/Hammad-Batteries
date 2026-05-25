export const DISPLAY_PHONE_NUMBER = "03392900269";
export const WHATSAPP_PHONE_NUMBER = "923392900269";

export const WHATSAPP_MESSAGES = {
  generalInquiry:
    "Assalam o Alaikum Hammad Batteries Team,\nPlease share available mobile batteries and delivery details.",
  productSupport:
    "Assalam o Alaikum Hammad Batteries Team,\nI need help choosing a mobile battery. Please guide me.",
  adminSupport:
    "Assalam o Alaikum Hammad Batteries Team,\nI need help with the website admin panel.",
};

export function getProductInquiryMessage(productName: string, price?: string) {
  const priceLine = price ? `\nListed price: ${price}` : "";

  return `Assalam o Alaikum,\nProduct: ${productName}${priceLine}\nPlease confirm availability.`;
}

export function getCartOrderMessage(
  items: Array<{ name: string; quantity: number; defaultPrice: string }>
) {
  const orderLines = items
    .map((item, index) => `${index + 1}. ${item.name} - Qty: ${item.quantity} - ${item.defaultPrice}`)
    .join("\n");

  return `Assalam o Alaikum,\nI want to order:\n${orderLines}\nPlease confirm availability.`;
}

export function getWhatsAppLink(message?: string) {
  const baseUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}`;

  if (!message) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
