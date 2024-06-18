const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'A simple Express API with Swagger documentation',
    },
  },
  // Paths to files containing OpenAPI definitions
  apis: [path.join(__dirname,'../routes/*.js') ],
};
const specs = swaggerJsdoc(options);

module.exports = {
  swaggerSpecs:specs
}