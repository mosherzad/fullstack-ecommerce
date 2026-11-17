/**
 * @openapi
 * /api/v1/cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Get the authenticated user's cart
 *     description: Returns the authenticated user's existing cart and its items, including selected product details (ID, name, image, serialized price, and slug). The operation does not create a cart. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN may read their own cart. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     responses:
 *       "200":
 *         description: Cart and its cart items.
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
 *                     cart:
 *                       $ref: "#/components/schemas/Cart"
 *                   required: [cart]
 *               required: [status, data]
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Clear the authenticated user's cart
 *     description: Deletes all CartItem records for the caller's existing cart and leaves the Cart record in place. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN may clear their own cart. Product stock is not changed. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     responses:
 *       "200":
 *         description: Cart items cleared.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *               required: [status]
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/cart/items:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add a product to the cart
 *     description: Adds a positive integer quantity for a product to the caller's cart. The productId is a string with no format validation. If the cart does not exist, it is created. If the product is already present, the requested quantity is incremented onto the current quantity; the combined quantity must not exceed the product's available stock. This operation does not decrement product stock. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN may modify their own cart. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AddToCartInput"
 *     responses:
 *       "200":
 *         description: The created or incremented cart item.
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
 *                     cartItem:
 *                       $ref: "#/components/schemas/CartItem"
 *                   required: [cartItem]
 *               required: [status, data]
 *       "400":
 *         description: Zod validation failed (productId must be a string and quantity must be a positive integer) or combined quantity exceeds available stock.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         description: The requested product does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/cart/items/{productId}:
 *   patch:
 *     tags:
 *       - Cart
 *     summary: Set a cart item's quantity
 *     description: Replaces the quantity for an item already in the caller's cart. The productId path value only requires a non-empty path value; the route does not validate a CUID format. The cart, product, and matching cart item must exist. quantity must be a positive integer and may not exceed available product stock. This operation does not decrement product stock. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN may modify their own cart. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: Product ID identifying the cart item.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateCartItemInput"
 *     responses:
 *       "200":
 *         description: Updated cart item.
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
 *                     cartItem:
 *                       $ref: "#/components/schemas/CartItem"
 *                   required: [cartItem]
 *               required: [status, data]
 *       "400":
 *         description: Zod validation failed (quantity must be a positive integer) or quantity exceeds available stock.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         description: The caller's cart, product, or matching cart item was not found.
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
 *       - Cart
 *     summary: Remove a product from the cart
 *     description: Deletes the matching CartItem from the caller's existing cart. The productId path value only requires a non-empty path value; it is not format-validated. An existing cart and matching cart item are required. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN may modify their own cart. Product stock is not changed. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: Product ID identifying the cart item to remove.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Cart item removed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *               required: [status]
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         description: The caller's cart or matching cart item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 */
