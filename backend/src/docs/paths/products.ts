/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List products
 *     description: Returns a paginated product catalog. Public requests omit products with zero stock. Search matches product name or description case-insensitively; categoryName is an exact, case-insensitive category-name filter. Price bounds are inclusive. This endpoint is public and does not require authentication.
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         description: Trimmed, case-insensitive substring matched against product name and description.
 *         schema:
 *           type: string
 *       - name: categoryName
 *         in: query
 *         required: false
 *         description: Exact category name, matched case-insensitively.
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         required: false.
 *         description: Inclusive minimum product price. Must be non-negative and no greater than maxPrice when both are supplied.
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: maxPrice
 *         in: query
 *         required: false
 *         description: Inclusive maximum product price. Must be non-negative and no less than minPrice when both are supplied.
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Sort order. Defaults to newest first.
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest, oldest, name_asc, name_desc]
 *           default: newest
 *       - name: page
 *         in: query
 *         required: false
 *         description: One-based page number. Defaults to 1.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of products per page, from 1 to 100. Defaults to 10.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       "200":
 *         description: Paginated product results with category name and review statistics for each product.
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
 *                   description: Number of products in this page.
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                   required: [page, limit, total, totalPages]
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Product"
 *                   required: [products]
 *               required: [status, results, pagination, data]
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product
 *     description: Returns one product by ID, including selected review fields and aggregate rating data. This public lookup does not filter out-of-stock products.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Product details.
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
 *                     productWithRating:
 *                       $ref: "#/components/schemas/ProductDetails"
 *                   required: [productWithRating]
 *               required: [status, data]
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/admin/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List products for administrators
 *     description: Returns the paginated product catalog, including products with zero stock. Requires an authenticated ADMIN user; authentication uses the accessToken cookie.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         description: Trimmed, case-insensitive substring matched against product name and description.
 *         schema:
 *           type: string
 *       - name: categoryName
 *         in: query
 *         required: false
 *         description: Exact category name, matched case-insensitively.
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         required: false
 *         description: Inclusive minimum product price. Must be non-negative and no greater than maxPrice when both are supplied.
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: maxPrice
 *         in: query
 *         required: false
 *         description: Inclusive maximum product price. Must be non-negative and no less than minPrice when both are supplied.
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Sort order. Defaults to newest first.
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest, oldest, name_asc, name_desc]
 *           default: newest
 *       - name: page
 *         in: query
 *         required: false
 *         description: One-based page number. Defaults to 1.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of products per page, from 1 to 100. Defaults to 10.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       "200":
 *         description: Paginated product results including review statistics and category name.
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Product"
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                   required: [products, total, page, limit, totalPages]
 *               required: [status, data]
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
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a product
 *     description: Creates a product as an administrator. The slug is generated from name; it is not an input field. image is an optional string value stored on the product, not an uploaded file. The created response contains the persisted Product fields, including the generated slug, nullable description and image, default isActive, and timestamps. Price is accepted as a JSON number and returned as a serialized Prisma Decimal string.
 *     security:
 *       - accessTokenCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateProductInput"
 *     responses:
 *       "201":
 *         description: Product created.
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
 *                     newProduct:
 *                       $ref: "#/components/schemas/ProductRecord"
 *                   required: [newProduct]
 *               required: [status, data]
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         $ref: "#/components/responses/Forbidden"
 *       "409":
 *         $ref: "#/components/responses/Conflict"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/admin/products/{id}:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update a product
 *     description: Updates the supplied product fields as an administrator. All input properties are optional; name, when supplied, must contain at least 3 characters. The request does not accept slug, isActive, or generated response fields. image is an optional string, not an uploaded file. Price is accepted as a JSON number and returned as a serialized Prisma Decimal string.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateProductInput"
 *     responses:
 *       "200":
 *         description: Product updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 message:
 *                   type: string
 *                   enum: [Product updated successfully]
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedProduct:
 *                       $ref: "#/components/schemas/ProductRecord"
 *                   required: [updatedProduct]
 *               required: [status, message, data]
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
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
 *     description: Deletes a product by ID as an administrator.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Product deleted.
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
 *       "403":
 *         $ref: "#/components/responses/Forbidden"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 */
