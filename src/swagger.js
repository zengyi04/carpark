const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Carpark Information API',
      version: '1.0.0',
      description: 'API for managing HDB carpark information with filtering and favorites',
      contact: {
        name: 'Support Team',
        email: 'support@carpark.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Carpark: {
          type: 'object',
          properties: {
            carParkNo: {
              type: 'string',
              description: 'Unique carpark identifier'
            },
            address: {
              type: 'string',
              description: 'Carpark address'
            },
            xCoord: {
              type: 'number',
              format: 'float',
              description: 'X coordinate'
            },
            yCoord: {
              type: 'number',
              format: 'float',
              description: 'Y coordinate'
            },
            carParkType: {
              type: 'string',
              enum: ['BASEMENT CAR PARK', 'MULTI-STOREY CAR PARK', 'SURFACE CAR PARK'],
              description: 'Type of carpark'
            },
            typeOfParkingSystem: {
              type: 'string',
              description: 'Parking system type (e.g., ELECTRONIC, COUPON)'
            },
            shortTermParking: {
              type: 'string',
              description: 'Short term parking availability'
            },
            freeParking: {
              type: 'string',
              description: 'Free parking availability'
            },
            nightParking: {
              type: 'string',
              enum: ['YES', 'NO'],
              description: 'Whether night parking is available'
            },
            carParkDecks: {
              type: 'integer',
              description: 'Number of decks'
            },
            gantryHeight: {
              type: 'number',
              format: 'float',
              description: 'Gantry height in meters'
            },
            carParkBasement: {
              type: 'string',
              enum: ['Y', 'N'],
              description: 'Whether carpark has basement'
            }
          }
        },
        Favorite: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Favorite record ID'
            },
            carpark: {
              $ref: '#/components/schemas/Carpark'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            count: {
              type: 'integer',
              description: 'Number of records returned'
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Carpark'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Carparks',
        description: 'Carpark information and filtering endpoints'
      },
      {
        name: 'Favorites',
        description: 'User favorite carpark management endpoints'
      }
    ]
  },
  apis: [
    './src/routes/carparks.js',
    './src/routes/favorites.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
