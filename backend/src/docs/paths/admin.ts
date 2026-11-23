/**
 * @openapi
 * /api/v1/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get dashboard statistics
 *     description: Returns counts for all users, active users, products, products with stock exactly zero, and orders, along with counts of PENDING and DELIVERED orders. revenue.total is the sum of totals for DELIVERED orders; if the aggregate is null, the controller returns numeric 0. Requires the accessToken cookie and the ADMIN role. No query parameters or request body are used. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     responses:
 *       "200":
 *         description: Dashboard statistics.
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
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           minimum: 0
 *                         active:
 *                           type: integer
 *                           minimum: 0
 *                       required:
 *                         - total
 *                         - active
 *                     products:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           minimum: 0
 *                         outOfStock:
 *                           type: integer
 *                           minimum: 0
 *                       required:
 *                         - total
 *                         - outOfStock
 *                     orders:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           minimum: 0
 *                         pending:
 *                           type: integer
 *                           minimum: 0
 *                         delivered:
 *                           type: integer
 *                           minimum: 0
 *                       required:
 *                         - total
 *                         - pending
 *                         - delivered
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           oneOf:
 *                             - type: string
 *                               description: Prisma Decimal JSON serialization of the delivered-order total aggregate.
 *                             - type: number
 *                               enum: [0]
 *                               description: Returned when the delivered-order total aggregate is null.
 *                       required:
 *                         - total
 *                   required:
 *                     - users
 *                     - products
 *                     - orders
 *                     - revenue
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
