/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: List categories
 *     description: Returns all categories without pagination, filtering, or related products. This endpoint is public.
 *     responses:
 *       "200":
 *         description: All categories.
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
 *                     categories:
 *                       type: array
 *                       description: The response currently uses this misspelled property name.
 *                       items:
 *                         $ref: "#/components/schemas/Category"
 *                   required: [categoies]
 *               required: [status, data]
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get a category
 *     description: Returns one category by ID without related products. This endpoint is public.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID. The route checks that it is present but does not validate its format.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Category details.
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
 *                     category:
 *                       $ref: "#/components/schemas/Category"
 *                   required: [category]
 *               required: [status, data]
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/admin/categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a category
 *     description: Creates a category. Requires an authenticated ADMIN user; authentication uses the accessToken cookie. The slug is generated from the validated name and is not accepted as input. The response is the persisted category, including its generated ID, slug, timestamps, and nullable image.
 *     security:
 *       - accessTokenCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateCategoryInput"
 *     responses:
 *       "201":
 *         description: Category created.
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
 *                     newCategory:
 *                       $ref: "#/components/schemas/Category"
 *                   required: [newCategory]
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
 * /api/v1/admin/categories/{id}:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Update a category
 *     description: Updates the supplied category fields. Requires an authenticated ADMIN user; authentication uses the accessToken cookie. All request properties are optional. Updating the name does not regenerate the slug; slug is not an accepted input field.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID. The route checks that it is present but does not validate its format.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateCategoryInput"
 *     responses:
 *       "200":
 *         description: Category updated.
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
 *                   enum: [Category updated successfully]
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCategory:
 *                       $ref: "#/components/schemas/Category"
 *                   required: [updatedCategory]
 *               required: [status, message, data]
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "403":
 *         $ref: "#/components/responses/Forbidden"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "409":
 *         $ref: "#/components/responses/Conflict"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete a category
 *     description: Deletes a category by ID. Requires an authenticated ADMIN user; authentication uses the accessToken cookie. Deletion can fail if the category is still referenced by products.
 *     security:
 *       - accessTokenCookie: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID. The route checks that it is present but does not validate its format.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Category deleted.
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
