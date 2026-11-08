export const calculateDiscount = (
  subtotal: number,
  discountType: "PERCENTAGE" | "FIXED",
  discountValue: number,
  maxDiscount: number | null,
) => {
  let discountAmount = 0;

  if (discountType === "PERCENTAGE") {
    discountAmount = (subtotal * discountValue) / 100;

    if (maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, maxDiscount);
    }
  } else {
    discountAmount = discountValue;
  }

  return Math.min(discountAmount, subtotal);
};
