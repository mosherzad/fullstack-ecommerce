/**
 * @openapi
 * /api/v1/cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Get the authenticated user's cart
 *     description: Returns the authenticated user's cart and its items, including selected product details such as product name, image, price, and slug. The cart must already exist; this operation does not create one. Requires the accessToken cookie.
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
 *     description: Deletes all cart items for the caller but leaves the cart itself in place. Requires an existing cart and the accessToken cookie; any authenticated user may clear their own cart.
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
 *     description: Adds the requested quantity to the caller's cart. If the cart does not exist, it is created. If the product is already in the cart, the requested quantity is added to its current quantity; the combined quantity may not exceed available stock. This operation does not decrement product stock. Requires the accessToken cookie; any authenticated user may modify their own cart.
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
 *         description: Request validation failed or combined quantity exceeds available stock.
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
 *     description: Replaces the quantity for an item already in the caller's cart. The cart and product must exist, and the item must already belong to the cart. The requested quantity may not exceed available product stock. This operation does not decrement product stock. Requires the accessToken cookie; any authenticated user may modify their own cart.
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
 *         description: Request validation failed, productId is missing, or quantity exceeds available stock.
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
 *     description: Removes the matching item from the caller's existing cart. Requires the accessToken cookie; any authenticated user may modify their own cart. Product stock is not changed.
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
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
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
