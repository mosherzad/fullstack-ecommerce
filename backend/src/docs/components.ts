/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         photo:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - name
 *         - email
 *         - role
 *         - createdAt
 *         - updatedAt
 *
 *     ProductCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *       required:
 *         - name
 *
 *     ProductReviewSummary:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         rating:
 *           type: integer
 *         comment:
 *           type: string
 *           nullable: true
 *       required:
 *         - userId
 *         - rating
 *         - comment
 *
 *     ProductBase:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         stock:
 *           type: integer
 *         image:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         categoryId:
 *           type: string
 *         averageRating:
 *           type: number
 *           nullable: true
 *         reviewCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - description
 *         - price
 *         - stock
 *         - image
 *         - isActive
 *         - categoryId
 *         - averageRating
 *         - reviewCount
 *         - createdAt
 *         - updatedAt
 *
 *     Product:
 *       allOf:
 *         - $ref: "#/components/schemas/ProductBase"
 *         - type: object
 *           properties:
 *             category:
 *               $ref: "#/components/schemas/ProductCategory"
 *           required:
 *             - category
 *
 *     ProductDetails:
 *       allOf:
 *         - $ref: "#/components/schemas/ProductBase"
 *         - type: object
 *           properties:
 *             reviews:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ProductReviewSummary"
 *           required:
 *             - reviews
 *
 *     CreateProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *           exclusiveMinimum: true
 *         stock:
 *           type: integer
 *           minimum: 0
 *         categoryId:
 *           type: string
 *         image:
 *           type: string
 *       required:
 *         - name
 *         - price
 *         - stock
 *         - categoryId
 *
 *     UpdateProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *           exclusiveMinimum: true
 *         stock:
 *           type: integer
 *           minimum: 0
 *         categoryId:
 *           type: string
 *         image:
 *           type: string
 *
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         image:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - image
 *         - createdAt
 *         - updatedAt
 *
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         cartId:
 *           type: string
 *         productId:
 *           type: string
 *         quantity:
 *           type: integer
 *       required:
 *         - id
 *         - cartId
 *         - productId
 *         - quantity
 *
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CartItem"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - userId
 *         - items
 *         - createdAt
 *         - updatedAt
 *
 *     ShippingAddress:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *         phone:
 *           type: string
 *         city:
 *           type: string
 *         address:
 *           type: string
 *       required:
 *         - fullName
 *         - phone
 *         - city
 *         - address
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orderId:
 *           type: string
 *         productId:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - orderId
 *         - productId
 *         - quantity
 *         - price
 *         - createdAt
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         couponId:
 *           type: string
 *           nullable: true
 *         subtotal:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         discountAmount:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         total:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         paymentMethod:
 *           type: string
 *           enum: [COD, STRIPE]
 *         paymentStatus:
 *           type: string
 *           enum: [UNPAID, PAID, FAILED]
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItem"
 *         shippingAddress:
 *           $ref: "#/components/schemas/ShippingAddress"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - total
 *         - paymentMethod
 *         - status
 *
 *     ReviewUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *       required:
 *         - id
 *         - name
 *
 *     ReviewProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *       required:
 *         - id
 *         - name
 *
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         rating:
 *           type: integer
 *         comment:
 *           type: string
 *           nullable: true
 *         userId:
 *           type: string
 *         productId:
 *           type: string
 *         user:
 *           $ref: "#/components/schemas/ReviewUser"
 *         product:
 *           $ref: "#/components/schemas/ReviewProduct"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - rating
 *         - comment
 *         - userId
 *         - productId
 *         - createdAt
 *         - updatedAt
 *
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *         discountType:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *         discountValue:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         minOrderAmount:
 *           type: string
 *           nullable: true
 *           description: Prisma Decimal serialized as a JSON string.
 *         maxDiscount:
 *           type: string
 *           nullable: true
 *           description: Prisma Decimal serialized as a JSON string.
 *         usageLimit:
 *           type: integer
 *           nullable: true
 *         usedCount:
 *           type: integer
 *         startsAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - code
 *         - discountType
 *         - discountValue
 *         - minOrderAmount
 *         - maxDiscount
 *         - usageLimit
 *         - usedCount
 *         - startsAt
 *         - expiresAt
 *         - isActive
 *         - createdAt
 *         - updatedAt
 *
 *     PaginationMetadata:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         hasNextPage:
 *           type: boolean
 *         hasPrevPage:
 *           type: boolean
 *       required:
 *         - page
 *         - limit
 *         - total
 *         - totalPages
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *         message:
 *           type: string
 *         results:
 *           type: integer
 *         pagination:
 *           $ref: "#/components/schemas/PaginationMetadata"
 *         data:
 *           type: object
 *           additionalProperties: true
 *       required:
 *         - status
 *
 *     MessageSuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           enum: [success]
 *         data:
 *           type: object
 *           additionalProperties: true
 *       required:
 *         - message
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [fail, error]
 *         message:
 *           type: string
 *       required:
 *         - status
 *         - message
 *
 *   responses:
 *     BadRequest:
 *       description: The request was invalid.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *     Unauthorized:
 *       description: Authentication is required or the provided credentials are invalid.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *     Forbidden:
 *       description: The caller is not permitted to perform the requested operation.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *     NotFound:
 *       description: The requested resource was not found.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *     Conflict:
 *       description: The request conflicts with an existing record.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *     TooManyRequests:
 *       description: The request limit has been exceeded.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *     InternalServerError:
 *       description: An unexpected server error occurred.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 */
