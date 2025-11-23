/**
 * Authentication Routes
 * 
 * User authentication and profile management endpoints
 * 
 * @module routes/auth
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, validators } = require('../middlewares/inputValidation');
const { csrfProtect } = require('../middlewares/csrf');
const { body, param } = require('express-validator'); // ✅ FIXED IMPORT

// -------------------------
// Public Routes
// -------------------------

router.post(
  '/register',
  validate([
    validators.email,
    validators.password,
    body('name').optional().isString().trim().isLength({ min: 1, max: 255 }),
    body('username').optional().isString().trim().isLength({ min: 3, max: 32 })
  ]),
  userController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 })
  ]),
  userController.login
);

router.post(
  '/refresh',
  validate([body('refreshToken').isString().notEmpty()]),
  userController.refreshToken
);

router.post(
  '/forgot-password',
  validate([body('email').isEmail().normalizeEmail()]),
  userController.forgotPassword
);

router.post(
  '/reset-password',
  validate([
    body('token').isString().notEmpty(),
    validators.password
  ]),
  userController.resetPassword
);

router.get(
  '/verify-email/:token',
  validate([param('token').isString().notEmpty()]),
  userController.verifyEmail
);

// -------------------------
// Protected Routes
// -------------------------

router.use(authenticate);

router.get('/me', userController.getProfile);

router.patch(
  '/me',
  csrfProtect,
  validate([
    body('name').optional().isString().trim().isLength({ min: 1, max: 255 }),
    body('email').optional().isEmail().normalizeEmail()
  ]),
  userController.updateProfile
);

router.post(
  '/change-password',
  csrfProtect,
  validate([
    body('currentPassword').isString().notEmpty(),
    validators.password
  ]),
  userController.changePassword
);

router.post('/logout', csrfProtect, userController.logout);

module.exports = router;
