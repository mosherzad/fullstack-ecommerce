import { sendEmail } from "../utils/email.js";

type OrderEmailData = {
  id: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
};

export const sendOrderConfirmationEmail = async (
  email: string,
  order: OrderEmailData,
) => {
  const subject = "Your Order Has Been Confirmed!";

  const text = `
Hello,

Thank you for your order!

Your order has been successfully placed.

Order Details:
-------------------------
Order ID: ${order.id}
Order Status: ${order.status}

Subtotal: $${Number(order.subtotal).toFixed(2)}
Discount: $${Number(order.discountAmount).toFixed(2)}
Total: $${Number(order.total).toFixed(2)}

-------------------------

We appreciate your business!

Thank you for shopping with us.
  `;

  return sendEmail(email, subject, text);
};

export const sendOrderShippedEmail = async (
  email: string,
  order: OrderEmailData,
) => {
  const subject = "Your Order Has Been Shipped!";

  const text = `
Hello,

Good news! Your order is on its way.

Order Details:
-------------------------
Order ID: ${order.id}
Order Status: ${order.status}
Total: $${Number(order.total).toFixed(2)}

Your order has been shipped and is on its way to you.

Thank you for shopping with us!
`;

  return sendEmail(email, subject, text);
};

export const sendOrderDeliveredEmail = async (
  email: string,
  order: OrderEmailData,
) => {
  const subject = "Your Order Has Been Delivered!";

  const text = `
Hello,

Great news! Your order has been successfully delivered.

Order Details:
-------------------------
Order ID: ${order.id}
Order Status: ${order.status}
Total: $${order.total.toFixed(2)}

We hope you enjoy your purchase!

Thank you for shopping with us.
`;

  return sendEmail(email, subject, text);
};

export const sendOrderCancelledEmail = async (
  email: string,
  order: OrderEmailData,
) => {
  const subject = "Your Order Has Been Cancelled";

  const text = `
Hello,

Your order has been successfully cancelled.

Order Details:
-------------------------
Order ID: ${order.id}
Order Status: ${order.status}
Total: $${order.total.toFixed(2)}

If you have any questions, please contact our support team.

Thank you.
`;

  return sendEmail(email, subject, text);
};
