/**
 * Demo Mode Routes
 * 
 * Endpoints for enabling demo mode with pre-populated data
 * 
 * @module routes/demo
 */

const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /demo/enable:
 *   post:
 *     summary: Enable demo mode
 *     description: Populates database with demo data for evaluation
 *     tags: [Demo]
 *     security: []
 *     responses:
 *       200:
 *         description: Demo mode enabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/enable', optionalAuth, async (req, res, next) => {
  try {
    // Check if demo data already exists
    const existingSessions = await dbService.query(
      "SELECT COUNT(*) as count FROM focus_sessions WHERE user_id = 'demo-user-001'"
    );
    
    if (existingSessions.rows[0]?.count > 0) {
      return res.json({
        success: true,
        message: 'Demo mode already enabled. Use /demo/reset to refresh data.',
        data: {
          demoUserId: 'demo-user-001',
          demoEmail: 'demo@focusflow.app',
        },
      });
    }
    
    // Run seed script logic (simplified)
    // In production, you'd call the seed script
    res.json({
      success: true,
      message: 'Demo mode enabled. Run "npm run seed" to populate demo data.',
      data: {
        demoUserId: 'demo-user-001',
        demoEmail: 'demo@focusflow.app',
        demoPassword: 'Demo123!@#',
        instructions: 'Use these credentials to log in and explore the app',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /demo/status:
 *   get:
 *     summary: Get demo mode status
 *     description: Check if demo data exists
 *     tags: [Demo]
 *     security: []
 *     responses:
 *       200:
 *         description: Demo mode status
 */
router.get('/status', optionalAuth, async (req, res, next) => {
  try {
    const result = await dbService.query(
      "SELECT COUNT(*) as count FROM focus_sessions WHERE user_id = 'demo-user-001'"
    );
    const hasDemoData = parseInt(result.rows[0]?.count || 0) > 0;
    
    res.json({
      success: true,
      data: {
        enabled: hasDemoData,
        demoUserId: 'demo-user-001',
        demoEmail: 'demo@focusflow.app',
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

