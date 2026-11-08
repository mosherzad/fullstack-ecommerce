import { describe, it, expect } from "vitest";
import { calculateDiscount } from "../helpers/calculateDiscount.js";

describe("calculateDiscount", () => {
  it("should calculate a percentage discount correctly", () => {
    const result = calculateDiscount(100, "PERCENTAGE", 20, null);

    expect(result).toBe(20);
  });

  it("should apply maxDiscount when percentage discount exceeds the limit", () => {
    const result = calculateDiscount(100, "PERCENTAGE", 50, 30);

    expect(result).toBe(30);
  });

  it("should not apply maxDiscount when calculated discount is lower", () => {
    const result = calculateDiscount(100, "PERCENTAGE", 10, 30);

    expect(result).toBe(10);
  });

  it("should calculate a fixed discount correctly", () => {
    const result = calculateDiscount(100, "FIXED", 25, null);

    expect(result).toBe(25);
  });

  it("should not allow fixed discount to exceed subtotal", () => {
    const result = calculateDiscount(100, "FIXED", 150, null);

    expect(result).toBe(100);
  });

  it("should return zero when subtotal is zero", () => {
    const result = calculateDiscount(0, "PERCENTAGE", 20, null);

    expect(result).toBe(0);
  });

  it("should return zero when discount value is zero", () => {
    const result = calculateDiscount(100, "FIXED", 0, null);

    expect(result).toBe(0);
  });

  it("should return the full subtotal for a 100% discount", () => {
    const result = calculateDiscount(100, "PERCENTAGE", 100, null);

    expect(result).toBe(100);
  });

  it("should handle decimal percentage calculations", () => {
    const result = calculateDiscount(99.99, "PERCENTAGE", 10, null);

    expect(result).toBeCloseTo(9.999);
  });

  it("should handle decimal fixed discounts", () => {
    const result = calculateDiscount(100, "FIXED", 12.5, null);

    expect(result).toBe(12.5);
  });

  it("should return zero when maxDiscount is zero", () => {
    const result = calculateDiscount(100, "PERCENTAGE", 20, 0);

    expect(result).toBe(0);
  });
});
