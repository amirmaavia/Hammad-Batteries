import nodemailer from "nodemailer";
import type { StoreOrder } from "./ecommerce";

const storeEmail = process.env.STORE_ORDER_EMAIL || "";
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || smtpUser;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

function isEmailConfigured() {
  return Boolean(smtpHost && smtpUser && smtpPass && smtpFrom);
}

function orderNumber(order: StoreOrder) {
  return order.id.slice(-8).toUpperCase();
}

function orderLines(order: StoreOrder) {
  return order.items.map((item) => `${item.name} x${item.quantity}`).join("\n");
}

function deliveryLine(order: StoreOrder) {
  return `${order.deliveryAddress}, ${order.deliveryCity}`;
}

function deliveryCharge(order: StoreOrder) {
  return order.deliveryCharge || 0;
}

function absoluteUrl(path: string) {
  if (!siteUrl) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function productUrl(itemId: string) {
  return absoluteUrl(`/items/${encodeURIComponent(itemId)}`);
}

function money(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

function paymentLine(order: StoreOrder) {
  if (order.paymentStatus === "Online Paid") {
    return `Online Paid${order.stripePaymentId ? ` (${order.stripePaymentId})` : ""}`;
  }

  if (order.paymentStatus === "Online Pending") {
    return "Online Pending / Not paid yet";
  }

  return "COD / Not paid yet";
}

function paymentStatusHtml(order: StoreOrder) {
  const paid = order.paymentStatus === "Online Paid";
  return `
    <div style="padding:14px 16px;background:${paid ? "#dcfce7" : "#f8fafc"};border:1px solid ${paid ? "#86efac" : "#d1d5db"};border-radius:12px;margin-bottom:18px;">
      <strong>Payment:</strong> ${paymentLine(order)}
    </div>
  `;
}

function lineItemHtml(order: StoreOrder) {
  return order.items
    .map((item) => {
      const href = productUrl(item._id);
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
            <a href="${href}" style="color:#2563eb;text-decoration:none;font-weight:700;">${item.name}</a>
            <div style="color:#64748b;font-size:13px;">${item.brand}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;">x${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${item.defaultPrice}</td>
        </tr>
      `;
    })
    .join("");
}

function summaryRow(label: string, value: string, strong = false) {
  return `
    <tr>
      <td style="padding:7px 0;color:#64748b;">${label}</td>
      <td style="padding:7px 0;text-align:right;${strong ? "font-size:18px;font-weight:800;color:#0f172a;" : "font-weight:700;color:#0f172a;"}">${value}</td>
    </tr>
  `;
}

function emailShell(content: string) {
  const logoUrl = absoluteUrl("/email-logo.png");
  return `
    <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
              <tr>
                <td style="padding:24px 28px;background:#0f172a;">
                  <img src="${logoUrl}" alt="Hammad Batteries" width="72" style="display:block;width:72px;height:auto;margin-bottom:10px;" />
                  <div style="color:#ffffff;font-size:22px;font-weight:800;">Hammad Batteries</div>
                  <div style="color:#bfdbfe;font-size:13px;margin-top:4px;">Premium mobile batteries across Pakistan</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  ${content}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function orderSummaryHtml(order: StoreOrder) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;border-collapse:collapse;">
      ${summaryRow("Subtotal", money(order.subtotal || 0))}
      ${order.discountAmount ? summaryRow("Promo discount", `-${money(order.discountAmount)}`) : ""}
      ${summaryRow("Delivery charge", money(deliveryCharge(order)))}
      ${summaryRow("Total", money(order.total), true)}
    </table>
  `;
}

async function sendMail(options: { to: string; subject: string; text: string; html: string }) {
  if (!isEmailConfigured()) {
    console.info("Email not sent because SMTP settings are not configured.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpFrom,
    ...options,
  });
}

export async function sendOrderPlacedEmails(order: StoreOrder) {
  const number = orderNumber(order);
  const subject = `Order ${number} received`;
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Your order ${number} has been received.`,
    `Subtotal: ${money(order.subtotal || 0)}`,
    order.discountAmount ? `Promo discount: -Rs. ${order.discountAmount.toLocaleString("en-PK")}` : "",
    `Delivery charge: ${money(deliveryCharge(order))}`,
    `Total: ${money(order.total)}`,
    `Payment: ${paymentLine(order)}`,
    `Delivery: ${deliveryLine(order)}`,
    "",
    "Items:",
    orderLines(order),
    "",
    "Product links:",
    ...order.items.map((item) => `${item.name}: ${productUrl(item._id)}`),
    "",
    "We will contact you when your order ships.",
  ].join("\n");
  const html = emailShell(`
    <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;">Order ${number} received</h1>
    <p style="margin:0 0 16px;color:#334155;">Hi ${order.customerName}, your order has been received.</p>
    ${paymentStatusHtml(order)}
    <div style="padding:14px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin-bottom:18px;">
      <strong>Delivery:</strong> ${deliveryLine(order)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left" style="padding-bottom:8px;color:#64748b;font-size:12px;text-transform:uppercase;">Product</th>
          <th style="padding-bottom:8px;color:#64748b;font-size:12px;text-transform:uppercase;">Qty</th>
          <th align="right" style="padding-bottom:8px;color:#64748b;font-size:12px;text-transform:uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>${lineItemHtml(order)}</tbody>
    </table>
    ${orderSummaryHtml(order)}
    <p style="margin:20px 0 0;color:#334155;">We will contact you when your order ships.</p>
  `);

  await sendMail({ to: order.customerEmail, subject, text, html });

  if (storeEmail) {
    await sendMail({
      to: storeEmail,
      subject: `New order ${number}`,
      text: `${order.customerName} placed order ${number}.\n\n${text}`,
      html: emailShell(`
        <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;">New order ${number}</h1>
        <p style="margin:0 0 16px;color:#334155;">${order.customerName} placed a new order.</p>
        ${paymentStatusHtml(order)}
        <div style="padding:14px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin-bottom:18px;">
          <strong>Delivery:</strong> ${deliveryLine(order)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tbody>${lineItemHtml(order)}</tbody>
        </table>
        ${orderSummaryHtml(order)}
      `),
    });
  }
}

export async function sendOrderPaymentConfirmedEmails(order: StoreOrder) {
  const number = orderNumber(order);
  const subject = `Payment received for order ${number}`;
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Payment has been received for order ${number}.`,
    `Payment: ${paymentLine(order)}`,
    `Total: ${money(order.total)}`,
    "",
    "We will contact you when your order ships.",
  ].join("\n");
  const html = emailShell(`
    <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;">Payment received</h1>
    <p style="margin:0 0 16px;color:#334155;">Hi ${order.customerName}, your payment for order ${number} has been received.</p>
    ${paymentStatusHtml(order)}
    ${orderSummaryHtml(order)}
    <p style="margin:20px 0 0;color:#334155;">We will contact you when your order ships.</p>
  `);

  await sendMail({ to: order.customerEmail, subject, text, html });

  if (storeEmail) {
    await sendMail({
      to: storeEmail,
      subject: `Payment received for order ${number}`,
      text: `${order.customerName} paid order ${number}.\n\n${text}`,
      html: emailShell(`
        <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;">Payment received for order ${number}</h1>
        <p style="margin:0 0 16px;color:#334155;">${order.customerName} paid this order online.</p>
        ${paymentStatusHtml(order)}
        ${orderSummaryHtml(order)}
      `),
    });
  }
}

export async function sendOrderShippedEmail(order: StoreOrder) {
  const number = orderNumber(order);
  const subject = `Order ${number} shipped`;
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Your order ${number} has been shipped.`,
    `Delivery: ${deliveryLine(order)}`,
    order.shippedAt ? `Shipped at: ${new Date(order.shippedAt).toLocaleString("en-PK")}` : "",
    "",
    "Product links:",
    ...order.items.map((item) => `${item.name}: ${productUrl(item._id)}`),
    "",
    "You can view the latest status from your orders page.",
  ].filter(Boolean).join("\n");
  const html = emailShell(`
    <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;">Order ${number} shipped</h1>
    <p style="margin:0 0 16px;color:#334155;">Hi ${order.customerName}, your order has been shipped.</p>
    <div style="padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;margin-bottom:18px;">
      <strong>Delivery:</strong> ${deliveryLine(order)}
      ${order.shippedAt ? `<br /><strong>Shipped at:</strong> ${new Date(order.shippedAt).toLocaleString("en-PK")}` : ""}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tbody>${lineItemHtml(order)}</tbody>
    </table>
    <p style="margin:20px 0 0;color:#334155;">You can view the latest status from your orders page.</p>
  `);

  await sendMail({ to: order.customerEmail, subject, text, html });
}
