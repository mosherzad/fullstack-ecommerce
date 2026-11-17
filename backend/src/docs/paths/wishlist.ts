/**
 * @openapi
 * /api/v1/wishlist/my-wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get the authenticated user's wishlist
 *     description: Returns all wishlist items belonging to the authenticated user. Each item includes selected product fields (ID, name, serialized price, and nullable image). The operation does not create or filter a wishlist. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN can retrieve only their own wishlist. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     responses:
 *       "200":
 *         description: The caller's wishlist items.
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
 *                   description: Number of wishlist items returned.
 *                   minimum: 0
 *                 data:
 *                   type: object
 *                   properties:
 *                     wishlistItems:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/WishlistItemWithProduct"
 *                   required:
 *                     - wishlistItems
 *               required:
 *                 - status
 *                 - results
 *                 - data
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/wishlist/{id}:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Add a product to the wishlist
 *     description: Adds the product identified by id to the authenticated user's wishlist. The product must exist. The id path value only requires a non-empty value and is not format-validated. There is no separate Zod request body or Zod wishlist schema. Adding the same product twice for the same user violates the unique user/product constraint and returns a conflict. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN may modify only their own wishlist. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID. The route checks that the path value is present but does not validate its format.
 *         schema:
 *           type: string
 *     responses:
 *       "201":
 *         description: Wishlist item created.
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
 *                     wishlistItem:
 *                       $ref: "#/components/schemas/WishlistItem"
 *                   required:
 *                     - wishlistItem
 *               required:
 *                 - status
 *                 - data
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         description: The requested product does not exist.
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
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Remove a product from the wishlist
 *     description: Removes the wishlist item for the authenticated user and product id. The id path value only requires a non-empty value and is not format-validated. The implementation does not separately validate product existence; if no wishlist item matches the caller and product id, it returns 404. Requires the accessToken cookie and no role restriction; any authenticated USER or ADMIN may modify only their own wishlist. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID of the wishlist item to remove. The route checks that the path value is present but does not validate its format.
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Wishlist item removed. This response has no response body.
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         description: The caller has no wishlist item for the requested product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 */
