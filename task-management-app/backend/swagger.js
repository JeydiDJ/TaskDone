const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API documentation for the Task Management application',
      contact: {
        name: 'taskdone',
        url: 'https://https://task-done-g10-git-main-michael-usi-jrs-projects.vercel.app/',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://https://task-done-g10-git-main-michael-usi-jrs-projects.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './models/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;