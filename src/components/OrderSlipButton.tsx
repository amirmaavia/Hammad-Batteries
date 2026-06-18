'use client';

import { Download, Printer } from 'lucide-react';
import type { StoreOrder } from '@/lib/ecommerce';

type OrderSlipButtonProps = {
  order: StoreOrder;
  variant?: 'download' | 'print';
};

const shopName = 'Hammad Batteries';

function orderNumber(order: StoreOrder) {
  return order.id.slice(-8).toUpperCase();
}

function money(value: number) {
  return `Rs. ${value.toLocaleString('en-PK')}`;
}

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function orderSlipHtml(order: StoreOrder) {
  const number = orderNumber(order);
  const placedAt = new Date(order.createdAt).toLocaleString('en-PK');
  const shippedAt = order.shippedAt ? new Date(order.shippedAt).toLocaleString('en-PK') : 'Not shipped yet';
  const deliveryCharge = order.deliveryCharge || 0;
  const subtotal = order.subtotal || Math.max(0, order.total - deliveryCharge + (order.discountAmount || 0));

  const rows = order.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>
        <div class="product-cell">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />` : '<div class="image-fallback">HB</div>'}
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.brand || 'Product')}</span>
            <small>Product ID: ${escapeHtml(item._id)}</small>
          </div>
        </div>
      </td>
      <td>${escapeHtml(item.defaultPrice)}</td>
      <td>${item.quantity}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order Slip ${number}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: #111827; background: #f8fafc; }
    .page { max-width: 820px; margin: 24px auto; padding: 28px; background: #fff; border: 1px solid #e5e7eb; }
    .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #111827; padding-bottom: 18px; }
    h1 { margin: 0; font-size: 28px; letter-spacing: 0; }
    h2 { margin: 24px 0 10px; font-size: 16px; }
    p { margin: 4px 0; color: #374151; }
    .slip-number { text-align: right; font-size: 14px; }
    .slip-number strong { display: block; font-size: 22px; color: #111827; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
    .box { border: 1px solid #e5e7eb; padding: 12px; min-height: 104px; }
    .box span { display: block; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; font-size: 12px; text-transform: uppercase; color: #4b5563; }
    .product-cell { display: flex; gap: 10px; align-items: center; }
    .product-cell img, .image-fallback { width: 52px; height: 52px; border: 1px solid #e5e7eb; object-fit: contain; background: #f9fafb; }
    .image-fallback { display: grid; place-items: center; font-weight: 700; color: #6b7280; }
    .product-cell span, .product-cell small { display: block; color: #6b7280; margin-top: 2px; }
    .summary { width: 320px; margin-left: auto; margin-top: 18px; }
    .summary-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #e5e7eb; }
    .summary-row.total { font-size: 20px; font-weight: 700; border-bottom: 2px solid #111827; }
    .notes { margin-top: 28px; padding-top: 14px; border-top: 1px dashed #9ca3af; color: #4b5563; font-size: 13px; }
    .print-actions { display: flex; justify-content: flex-end; gap: 8px; margin: 18px auto 0; max-width: 820px; }
    .print-actions button { border: 1px solid #111827; background: #111827; color: white; padding: 10px 14px; cursor: pointer; }
    @media print {
      body { background: #fff; }
      .page { margin: 0; border: 0; max-width: none; }
      .print-actions { display: none; }
    }
    @media (max-width: 680px) {
      .page { margin: 0; padding: 18px; }
      .top, .grid { grid-template-columns: 1fr; display: grid; }
      .slip-number { text-align: left; }
      .summary { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button onclick="window.print()">Print / Save PDF</button>
  </div>
  <main class="page">
    <section class="top">
      <div>
        <h1>${shopName}</h1>
        <p>Delivery order slip</p>
        <p>Use this slip with the product package at delivery.</p>
      </div>
      <div class="slip-number">
        Order ID
        <strong>${number}</strong>
        <p>Full ID: ${escapeHtml(order.id)}</p>
        <p>Placed: ${placedAt}</p>
      </div>
    </section>

    <section class="grid">
      <div class="box">
        <span>Customer</span>
        <strong>${escapeHtml(order.customerName)}</strong>
        <p>${escapeHtml(order.customerEmail)}</p>
        <p>${escapeHtml(order.customerPhone || 'No phone')}</p>
      </div>
      <div class="box">
        <span>Delivery Address</span>
        <strong>${escapeHtml(order.deliveryCity || 'City not provided')}</strong>
        <p>${escapeHtml(order.deliveryAddress || 'No address')}</p>
      </div>
      <div class="box">
        <span>Payment</span>
        <strong>${escapeHtml(order.paymentStatus)}</strong>
        <p>Method: ${escapeHtml(order.paymentMethod.toUpperCase())}</p>
        ${order.stripePaymentId ? `<p>Stripe ID: ${escapeHtml(order.stripePaymentId)}</p>` : ''}
      </div>
      <div class="box">
        <span>Delivery Status</span>
        <strong>${escapeHtml(order.status)}</strong>
        <p>Shipping: ${escapeHtml(shippedAt)}</p>
      </div>
    </section>

    <h2>Products Attached With This Order</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Price</th>
          <th>Qty</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <section class="summary">
      <div class="summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      ${order.discountAmount ? `<div class="summary-row"><span>Promo ${escapeHtml(order.discountCode || '')}</span><strong>-${money(order.discountAmount)}</strong></div>` : ''}
      <div class="summary-row"><span>Delivery</span><strong>${money(deliveryCharge)}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${money(order.total)}</strong></div>
    </section>

    <section class="notes">
      <p>Delivery staff: match the Order ID and product details before handing over the package.</p>
      <p>Customer signature: __________________________ Date: __________________</p>
    </section>
  </main>
</body>
</html>`;
}

export default function OrderSlipButton({ order, variant = 'download' }: OrderSlipButtonProps) {
  const number = orderNumber(order);

  const downloadSlip = () => {
    const blob = new Blob([orderSlipHtml(order)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-slip-${number}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const printSlip = () => {
    const popup = window.open('', '_blank');
    if (!popup) {
      downloadSlip();
      return;
    }
    popup.document.write(orderSlipHtml(order));
    popup.document.close();
    popup.focus();
  };

  if (variant === 'print') {
    return (
      <button className="btn btn-outline btn-sm" type="button" onClick={printSlip}>
        <Printer size={14} />
        Print Slip
      </button>
    );
  }

  // return (
  //   <button className="btn btn-outline btn-sm" type="button" onClick={downloadSlip}>
  //     <Download size={14} />
  //     Download Slip
  //   </button>
  // );
}
