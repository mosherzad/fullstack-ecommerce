import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .min(1, "The rating should be 1 or more")
    .max(5, "The rating should not be greater than 5"),

  comment: z.string(),
});

export const updateReviewSchema = createReviewSchema.partial();
