import { Check, Circle } from 'lucide-react';
import type { StoreOrder } from '@/lib/ecommerce';

type PaymentStatusPanelProps = {
  order: StoreOrder;
  view?: 'user' | 'admin';
};

function paymentCopy(order: StoreOrder, view: NonNullable<PaymentStatusPanelProps['view']>) {
  const isUser = view === 'user';

  if (order.paymentStatus === 'Online Paid') {
    return {
      tone: 'paid',
      title: 'Online payment received',
      message: isUser ? 'Your online payment has been received successfully.' : 'Customer online payment has been received successfully.',
      note: order.stripePaymentId
        ? `Stripe payment ID: ${order.stripePaymentId}`
        : `Paid on ${new Date(order.createdAt).toLocaleString()}`,
    };
  }

  if (order.paymentStatus === 'Online Pending') {
    return {
      tone: 'pending',
      title: 'Online payment pending',
      message: isUser ? 'Your online payment has not been completed yet.' : 'Customer online payment has not been completed yet.',
      note: `Started on ${new Date(order.createdAt).toLocaleString()}`,
    };
  }

  return {
    tone: 'cod',
    title: 'Cash on Delivery',
    message: isUser ? 'Payment will be collected when your order is delivered.' : 'Payment will be collected when the order is delivered.',
    note: `Booked on ${new Date(order.createdAt).toLocaleString()}`,
  };
}

export default function PaymentStatusPanel({ order, view = 'user' }: PaymentStatusPanelProps) {
  const copy = paymentCopy(order, view);
  const isPaid = order.paymentStatus === 'Online Paid';

  return (
    <div className={`payment-status-layer payment-status-layer-${copy.tone}`}>
      <div className="payment-status-step">
        {isPaid ? <Check size={13} strokeWidth={3} /> : <Circle size={8} fill="currentColor" />}
      </div>
      <div>
        <strong>{copy.title}</strong>
        <span>{copy.message} {copy.note}</span>
      </div>
    </div>
  );
}
