/**
 * @openapi
 * /api/v1/auth/sign-up:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create an account
 *     description: Creates an account and sends an email verification link. The global limiter allows 100 requests per 15 minutes; the authentication limiter allows 10 requests per 15 minutes and skips successful requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               passwordConfirm:
 *                 type: string
 *             required:
 *               - id
 *               - name
 *               - email
 *               - role
 *     responses:
 *       "201":
 *         description: Account created. A verification email is sent; no authentication cookies are set.
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       allOf:
 *                         - $ref: "#/components/schemas/User"
 *                         - type: object
 *                           required:
 *                             - id
 *                             - createdAt
 *                             - updatedAt
 *                   required:
 *                     - user
 *               required:
 *                 - status
 *                 - message
 *                 - data
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "409":
 *         $ref: "#/components/responses/Conflict"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in
 *     description: Authenticates with an email and password. On success, sets HTTP-only accessToken (15 minutes) and refreshToken (7 days) cookies, with SameSite=Strict and Secure in production. Tokens are not returned in the JSON response. The global limiter allows 100 requests per 15 minutes; the authentication limiter allows 10 requests per 15 minutes and skips successful requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       "200":
 *         description: Login succeeded. Authentication tokens are set as HTTP-only cookies and are not included in the response body.
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
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [USER, ADMIN]
 *                   required:
 *                     - name
 *                     - email
 *                     - role
 *               required:
 *                 - status
 *                 - data
 *       "400":
 *         description: Request validation failed or the email and password are invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication cookies
 *     description: Reads the refreshToken cookie without requiring an access token. On success, rotates the refresh token and sets new HTTP-only accessToken and refreshToken cookies (15 minutes and 7 days, respectively; SameSite=Strict and Secure in production). Tokens are not returned in the JSON response. The global limiter allows 100 requests per 15 minutes; the authentication limiter allows 10 requests per 15 minutes and skips successful requests.
 *     parameters:
 *       - name: refreshToken
 *         in: cookie
 *         required: true
 *         description: Refresh token previously set by login or refresh.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Cookies were refreshed. No tokens are included in the JSON response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *               required:
 *                 - status
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log out
 *     description: Invalidates the refresh-token session when a valid refreshToken cookie is supplied, then clears both authentication cookies. This route does not require the protect middleware. The global limiter allows 100 requests per 15 minutes.
 *     parameters:
 *       - name: refreshToken
 *         in: cookie
 *         required: false
 *         description: Optional refresh token used to invalidate the session.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Logged out successfully; the accessToken and refreshToken cookies are cleared.
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
 *                   enum: [Logged out successfully]
 *               required:
 *                 - status
 *                 - message
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get the authenticated user
 *     description: Returns the current user's selected profile fields. Authentication reads the accessToken cookie, not an Authorization Bearer header. The global limiter allows 100 requests per 15 minutes.
 *     security:
 *       - accessTokenCookie: []
 *     responses:
 *       "200":
 *         description: Current user profile.
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
 *                     user:
 *                       allOf:
 *                         - $ref: "#/components/schemas/User"
 *                         - type: object
 *                           required:
 *                             - id
 *                             - photo
 *                             - isActive
 *                             - createdAt
 *                             - updatedAt
 *                   required:
 *                     - user
 *               required:
 *                 - status
 *                 - data
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/update-password:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Update the authenticated user's password
 *     description: Requires the current password and a new password of at least 8 characters. On success, invalidates existing sessions; the user must log in again. Authentication reads the accessToken cookie, not an Authorization Bearer header. The global limiter allows 100 requests per 15 minutes; the authentication limiter allows 10 requests per 15 minutes and skips successful requests.
 *     security:
 *       - accessTokenCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       "200":
 *         description: Password changed; existing refresh-token sessions are invalidated.
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
 *                   enum: ["Password changed successfully, Please login again"]
 *               required:
 *                 - status
 *                 - message
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 *       "404":
 *         $ref: "#/components/responses/NotFound"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/forget-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request a password reset email
 *     description: Requests a password reset link. The same success response is returned whether or not the account exists. For an existing account, the reset link expires after 10 minutes. The controller reads an email field but this route does not apply Zod request validation. The global limiter allows 100 requests per 15 minutes; the email limiter allows 5 requests per 15 minutes and skips successful requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Account email address. No format validation is performed by this route.
 *             required:
 *               - email
 *     responses:
 *       "200":
 *         description: A generic response that does not reveal whether the account exists.
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
 *                   enum: [If an account with that email exists, you will receive a password reset link.]
 *               required:
 *                 - status
 *                 - message
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/reset-password/{resetToken}:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Reset a password
 *     description: Resets the password using a URL token from the reset email. The token expires after 10 minutes. The route requires both password fields to be strings and the controller requires them to match; no minimum password length is enforced here. The global limiter allows 100 requests per 15 minutes; the authentication limiter allows 10 requests per 15 minutes and skips successful requests.
 *     parameters:
 *       - name: resetToken
 *         in: path
 *         required: true
 *         description: Password-reset token from the email link.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *               newPasswordConfirm:
 *                 type: string
 *             required:
 *               - newPassword
 *               - newPasswordConfirm
 *     responses:
 *       "200":
 *         description: Password changed and existing refresh-token sessions invalidated.
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
 *                   enum: [Password changed successfully]
 *               required:
 *                 - status
 *                 - message
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/resend-verification:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend an email verification link
 *     description: Sends a new verification link when the account exists and is not already verified. A generic success response is returned for missing or already-verified accounts. The controller reads an email field but this route does not apply Zod request validation. The global limiter allows 100 requests per 15 minutes; the email limiter allows 5 requests per 15 minutes and skips successful requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Account email address. No format validation is performed by this route.
 *             required:
 *               - email
 *     responses:
 *       "200":
 *         description: Generic for a missing or already-verified account; otherwise confirms that a verification message was sent.
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
 *               required:
 *                 - status
 *                 - message
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/send-verification-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Send an email verification link
 *     description: Sends a verification link when the account exists and is not already verified. A generic success response is returned for missing or already-verified accounts. The controller reads an email field but this route does not apply Zod request validation. The global limiter allows 100 requests per 15 minutes; the email limiter allows 5 requests per 15 minutes and skips successful requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Account email address. No format validation is performed by this route.
 *             required:
 *               - email
 *     responses:
 *       "200":
 *         description: Generic for a missing or already-verified account; otherwise confirms that a verification message was sent.
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
 *               required:
 *                 - status
 *                 - message
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 *
 * /api/v1/auth/verify-email/{verifyToken}:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify an email address
 *     description: Verifies the account using the token from the verification email. The token expires after 10 minutes. The global limiter allows 100 requests per 15 minutes.
 *     parameters:
 *       - name: verifyToken
 *         in: path
 *         required: true
 *         description: Email-verification token from the email link.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Email address verified.
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
 *                   enum: [Your account has been verified successfully]
 *               required:
 *                 - status
 *                 - message
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "429":
 *         $ref: "#/components/responses/TooManyRequests"
 *       "500":
 *         $ref: "#/components/responses/InternalServerError"
 */
