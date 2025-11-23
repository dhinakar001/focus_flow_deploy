/**
 * Swagger/OpenAPI Configuration
 * 
 * Interactive API documentation for FocusFlow
 * Access at: http://localhost:4000/api-docs
 * 
 * @module server/swagger
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FocusFlow API',
      version: '2.0.2',
      description: 'AI-powered productivity extension for Zoho Cliq. Complete API documentation for FocusFlow backend services.',
      contact: {
        name: 'FocusFlow Team',
        email: 'support@focusflow.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.focusflow.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error description',
                },
                code: {
                  type: 'string',
                  example: 'ERR_VALIDATION',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
          },
        },
        Health: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
            },
            service: {
              type: 'string',
              example: 'FocusFlow',
            },
            version: {
              type: 'string',
              example: '2.0.2',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
              example: 3600,
            },
            environment: {
              type: 'string',
              example: 'development',
            },
            database: {
              type: 'string',
              example: 'connected',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Focus Modes',
        description: 'Focus session management',
      },
      {
        name: 'Analytics',
        description: 'Productivity analytics and statistics',
      },
      {
        name: 'AI Features',
        description: 'AI-powered productivity features',
      },
      {
        name: 'Bot',
        description: 'Zoho Cliq bot integration',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints',
      },
    ],
  },
  apis: [
    './server/routes/*.js',
    './server/controllers/*.js',
    './server/index.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Swagger UI middleware
 */
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FocusFlow API Documentation',
  customfavIcon: '/favicon.ico',
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions,
};

