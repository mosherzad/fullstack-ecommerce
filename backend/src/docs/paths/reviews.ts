/**
 * @openapi
 * /api/v1/products/{id}/reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a product review
 *     description: Creates a review for the product identified by id for the authenticated user. The productId path value must be present but is not validated as a CUID by validateId. The product must exist. Authentication is required. The implementation does not verify that the user purchased the product. The Prisma model prevents one review per user and product pair; an existing pair produces a 409 conflict. Creation does not directly update Product fields. Product endpoints calculate averageRating and reviewCount from review records dynamically. Requires the accessToken cookie. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID. The route checks that the path value is present but does not validate its format.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateReviewInput"
 *     responses:
 *       "201":
 *         description: Review created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       $ref: "#/components/schemas/ReviewRecord"
 *                   required:
 *                     - review
 *               required:
 *                 - status
 *                 - data
 *       "400":
 *         description: Zod validation failed. rating must be a number between 1 and 5, and comment must be a string when supplied.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         description: The product ID was not found. A nonexistent or malformed ID that cannot resolve to a product returns 404 from the controller.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "409":
 *         $ref: "#/components/responses/Conflict"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/reviews/{reviewId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get a review by ID
 *     description: Retrieves one review by ID and includes selected reviewer and product information. This endpoint is public and does not require authentication or a role. The response includes id, rating, comment, userId, productId, createdAt, updatedAt, user with id and name, and product with id and name. The reviewId path value must be present but is not validated as a CUID. No pagination or filtering is implemented. The global limiter allows 100 requests per 15 minutes.
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: Review ID. The route checks that the path value is present but does not validate its format.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Review with selected user and product details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       $ref: "#/components/schemas/Review"
 *                   required:
 *                     - review
 *               required:
 *                 - message
 *                 - data
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "404":
 *         description: No review exists for the supplied ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *   patch:
 *     tags:
 *       - Reviews
 *     summary: Update a review
 *     description: Partially updates one review owned by the authenticated user. Authentication is required, and ownership is checked against review.userId. Administrators do not receive an ownership exception on this route. rating and comment are optional in the partial Zod schema; rating must be a number from 1 through 5 when supplied, and comment must be a string when supplied. Zod does not require at least one property. The update does not directly recalculate Product rating fields; product endpoints aggregate review records dynamically. Requires the accessToken cookie. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: Review ID. The route checks that the path value is present but does not validate its format.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateReviewInput"
 *     responses:
 *       "200":
 *         description: Review updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       $ref: "#/components/schemas/ReviewRecord"
 *                   required:
 *                     - review
 *               required:
 *                 - message
 *                 - data
 *       "400":
 *         description: Zod validation failed. Supplied rating must be a number from 1 through 5 and supplied comment must be a string.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         description: The authenticated user does not own the review.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "404":
 *         description: No review exists for the supplied ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review
 *     description: Deletes a review owned by the authenticated user. Authentication is required, and ownership is checked against review.userId. Administrators do not receive an ownership exception on this route and cannot delete another user's review through this endpoint. Deletion does not directly update Product fields; product endpoints aggregate the remaining review records dynamically. Requires the accessToken cookie. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: Review ID. The route checks that the path value is present but does not validate its format.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Review deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [success]
 *               required:
 *                 - message
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         description: The authenticated user does not own the review.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "404":
 *         description: No review exists for the supplied ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/admin/reviews:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: List all reviews as an administrator
 *     description: Returns all reviews with selected reviewer and product information. This route requires the accessToken cookie and the ADMIN role. Each review includes the nested user with id and name and nested product with id and name. No pagination, filtering, sorting, or query parameters are implemented. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     responses:
 *       "200":
 *         description: All review records with selected user and product details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Review"
 *                   required:
 *                     - reviews
 *               required:
 *                 - status
 *                 - data
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         $ref: "#/components/responses/Forbidden"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 */
