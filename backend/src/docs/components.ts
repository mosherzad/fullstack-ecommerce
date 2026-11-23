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
 *     ProductRecord:
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
 *         - createdAt
 *         - updatedAt
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
 *     CreateCategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Trimmed before validation; the resulting name must be 3 to 12 characters long.
 *         image:
 *           type: string
 *           description: Optional image string; leading and trailing whitespace is trimmed.
 *       required:
 *         - name
 *
 *     UpdateCategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Optional replacement name, trimmed before validation; the resulting name must be 3 to 12 characters long.
 *         image:
 *           type: string
 *           description: Optional image string; leading and trailing whitespace is trimmed.
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
 *           minimum: 1
 *       required:
 *         - id
 *         - cartId
 *         - productId
 *         - quantity
 *
 *     CartProductSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         slug:
 *           type: string
 *       required:
 *         - id
 *         - name
 *         - image
 *         - price
 *         - slug
 *
 *     CartItemWithProduct:
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
 *           minimum: 1
 *         product:
 *           $ref: "#/components/schemas/CartProductSummary"
 *       required:
 *         - id
 *         - cartId
 *         - productId
 *         - quantity
 *         - product
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
 *             $ref: "#/components/schemas/CartItemWithProduct"
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
 *     AddToCartInput:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: integer
 *           minimum: 1
 *       required:
 *         - productId
 *         - quantity
 *
 *     UpdateCartItemInput:
 *       type: object
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *       required:
 *         - quantity
 *
 *     WishlistProductSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         image:
 *           type: string
 *           nullable: true
 *       required:
 *         - id
 *         - name
 *         - price
 *         - image
 *
 *     WishlistItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         productId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - userId
 *         - productId
 *         - createdAt
 *
 *     WishlistItemWithProduct:
 *       allOf:
 *         - $ref: "#/components/schemas/WishlistItem"
 *         - type: object
 *           properties:
 *             product:
 *               $ref: "#/components/schemas/WishlistProductSummary"
 *           required:
 *             - product
 *
 *     ShippingAddress:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *         phone:
 *           type: string
 *           minLength: 7
 *           maxLength: 20
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         address:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *       required:
 *         - fullName
 *         - phone
 *         - city
 *         - address
 *
 *     CheckoutRequest:
 *       type: object
 *       properties:
 *         shippingAddress:
 *           $ref: "#/components/schemas/ShippingAddress"
 *         paymentMethod:
 *           type: string
 *           enum: [COD, STRIPE]
 *         code:
 *           type: string
 *           description: Optional coupon code. If supplied, the coupon must exist and be active and within its date and usage limits.
 *       required:
 *         - shippingAddress
 *         - paymentMethod
 *
 *     UpdateOrderStatusRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, SHIPPED, DELIVERED, CANCELLED]
 *       description: Status is optional in Zod; the implementation requires CANCELLED for non-admin callers.
 *
 *     MyOrderSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         total:
 *           type: string
 *           description: Prisma Decimal serialized as a JSON string.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         _count:
 *           type: object
 *           properties:
 *             items:
 *               type: integer
 *               minimum: 0
 *           required:
 *             - items
 *         shippingAddress:
 *           $ref: "#/components/schemas/ShippingAddress"
 *         paymentMethod:
 *           type: string
 *           enum: [COD, STRIPE]
 *       required:
 *         - id
 *         - status
 *         - total
 *         - createdAt
 *         - _count
 *         - shippingAddress
 *         - paymentMethod
 *
 *     CheckoutOrder:
 *       type: object
 *       description: The checkout projection returned by the controller. Order items do not include expanded Product objects.
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         subtotal:
 *           type: string
 *           description: Sum of each cart item's product price multiplied by quantity, serialized by Prisma as a JSON string.
 *         discountAmount:
 *           type: string
 *           description: Coupon discount, serialized by Prisma as a JSON string.
 *         total:
 *           type: string
 *           description: subtotal minus discountAmount, serialized by Prisma as a JSON string.
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         paymentMethod:
 *           type: string
 *           enum: [COD, STRIPE]
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItem"
 *       required:
 *         - id
 *         - userId
 *         - subtotal
 *         - discountAmount
 *         - total
 *         - status
 *         - paymentMethod
 *         - items
 *
 *     AdminOrder:
 *       type: object
 *       description: Full scalar Order record projection for the administrator list and get-by-ID controllers. No order-item relation or expanded product relation is included.
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
 *         discountAmount:
 *           type: string
 *         total:
 *           type: string
 *         paymentMethod:
 *           type: string
 *           enum: [COD, STRIPE]
 *         paymentStatus:
 *           type: string
 *           enum: [UNPAID, PAID, FAILED]
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
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
 *         - userId
 *         - couponId
 *         - subtotal
 *         - discountAmount
 *         - total
 *         - paymentMethod
 *         - paymentStatus
 *         - status
 *         - shippingAddress
 *         - createdAt
 *         - updatedAt
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
 *     CreateReviewInput:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Zod requires a number from 1 through 5. Zod does not enforce integer or step constraints.
 *         comment:
 *           type: string
 *           description: Optional comment. The Zod string schema does not trim or impose a minimum or maximum length.
 *       required:
 *         - rating
 *
 *     UpdateReviewInput:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Optional replacement rating from 1 through 5. Zod does not enforce integer or step constraints.
 *         comment:
 *           type: string
 *           description: Optional replacement comment. The Zod string schema does not trim or impose a minimum or maximum length.
 *
 *     ReviewRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *           nullable: true
 *         userId:
 *           type: string
 *         productId:
 *           type: string
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
