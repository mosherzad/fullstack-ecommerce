/**
 * @openapi
 * /api/v1/orders/checkout:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Checkout the authenticated user's cart
 *     description: Creates an order from the authenticated user's existing cart. It does not accept an item list in the request body; all cart items and quantities are read from the caller's cart. The shipping address and payment method are required. The subtotal is the sum of each cart product's current Decimal price multiplied by its cart quantity. A valid coupon code is optional and its discount is subtracted from the subtotal. Duplicate products, invalid products, insufficient stock, and coupon errors reject the transaction. Stock decrements and order creation are transactional with cart clearing; if a later step fails, the Prisma transaction rolls back stock and order changes. On success all CartItem rows for the cart are deleted within the same transaction. Requires the accessToken cookie and no role restriction. COD and STRIPE are accepted enum values, but no Stripe payment processing is implemented and payment status remains the Prisma default UNPAID. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CheckoutRequest"
 *     responses:
 *       "201":
 *         description: Order created and cart cleared.
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
 *                     order:
 *                       $ref: "#/components/schemas/CheckoutOrder"
 *                   required:
 *                     - order
 *               required:
 *                 - status
 *                 - data
 *       "400":
 *         description: Zod validation failed, the cart is empty, duplicate products exist, stock is insufficient, or a coupon is invalid or unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         description: The authenticated user was not found, a cart product was invalid, or a supplied coupon was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/orders/my-orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get the authenticated user's orders
 *     description: Returns orders belonging only to the authenticated user, sorted by createdAt descending. The response is a summary projection and does not include order items, item product information, subtotal, discountAmount, couponId, paymentStatus, or updatedAt. Requires the accessToken cookie and no role restriction; both USER and ADMIN roles are scoped to their own orders. Pagination, filtering, and sorting are not implemented for this endpoint. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     responses:
 *       "200":
 *         description: The caller's order summaries.
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/MyOrderSummary"
 *                   required:
 *                     - orders
 *               required:
 *                 - status
 *                 - data
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get an order by ID as an administrator
 *     description: Retrieves one scalar Order record by ID. This route requires the accessToken cookie and the ADMIN role. It does not include order items or expanded product information; it returns the Prisma scalar order fields, including shippingAddress and paymentStatus. A regular USER receives 403 from restrictTo. The path ID only requires a non-empty value; validateId does not validate CUID format. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Order ID. The route checks that the value is present but does not validate its format.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: The scalar order record.
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
 *                     order:
 *                       $ref: "#/components/schemas/AdminOrder"
 *                   required:
 *                     - order
 *               required:
 *                 - status
 *                 - data
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         $ref: "#/components/responses/Forbidden"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update an order status
 *     description: Updates an order status with role-dependent rules. An owner may submit only CANCELLED and only while the order is PENDING; cancellation restores every order item's quantity to product stock and is blocked when already cancelled. An ADMIN may set PENDING, SHIPPED, DELIVERED, or CANCELLED, may not set PROCESSING because the Zod request enum excludes it, and may cancel only a PENDING order. The service prevents a different user from changing status. It also blocks cancellation of already-cancelled or non-PENDING orders and uses an update transaction with optimistic status matching to prevent concurrent changes. PROCESSING is a Prisma model status but is not accepted as an update value. Status is optional in Zod, but omission is not a meaningful update; a regular user receives 400 and an administrator may receive a no-change result only if such an update is accepted by Prisma. The response includes the order with its OrderItem rows, but not expanded Product objects. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Order ID. The route checks that the value is present but does not validate its format.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateOrderStatusRequest"
 *     responses:
 *       "200":
 *         description: Status updated, or an administrator submitted a no-change status update.
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
 *                     order:
 *                       allOf:
 *                         - $ref: "#/components/schemas/AdminOrder"
 *                         - type: object
 *                           properties:
 *                             items:
 *                               type: array
 *                               items:
 *                                 $ref: "#/components/schemas/OrderItem"
 *                           required:
 *                             - items
 *                   required:
 *                     - order
 *               required:
 *                 - status
 *                 - data
 *       "400":
 *         description: Zod validation failed, a user tried to set a non-CANCELLED status or omitted status, the order is already cancelled, cancellation is not PENDING, or a concurrent status change was detected.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         description: A user attempted to update an order they do not own.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "404":
 *         description: The order or order owner's user record was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/admin/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: List all orders as an administrator
 *     description: Retrieves a paginated list of all orders. Requires the accessToken cookie and ADMIN role. The list uses scalar Order records only; it does not include order items or expanded product information. Status filtering is exact and sorting supports createdAt or total in ascending or descending order. Query values are validated by Zod. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: One-based page number. Must be an integer greater than zero. Defaults to 1.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of orders per page. Must be an integer from 1 through 100. Defaults to 10.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: status
 *         in: query
 *         required: false
 *         description: Exact order status filter.
 *         schema:
 *           type: string
 *           enum: [PENDING, SHIPPED, DELIVERED, CANCELLED]
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Sort order. Defaults to createdAt descending.
 *         schema:
 *           type: string
 *           enum: [createdAt_asc, createdAt_desc, total_asc, total_desc]
 *           default: createdAt_desc
 *     responses:
 *       "200":
 *         description: Paginated scalar order records.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 results:
 *                   type: integer
 *                   minimum: 0
 *                 pagination:
 *                   $ref: "#/components/schemas/PaginationMetadata"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/AdminOrder"
 *                   required:
 *                     - orders
 *               required:
 *                 - status
 *                 - results
 *                 - pagination
 *                 - data
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         $ref: "#/components/responses/Forbidden"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 */
