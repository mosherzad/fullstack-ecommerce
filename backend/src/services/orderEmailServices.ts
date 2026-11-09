import type { Order } from "../generated/prisma/client.js";
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
