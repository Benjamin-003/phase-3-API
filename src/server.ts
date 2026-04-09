import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import toolRoutes from './routes/toolRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import analyticRoutes from './routes/analyticRoutes.js';

export const app = express();

const port = Number(process.env.PORT) || 3000;
const apiUrl = process.env.API_URL || `http://localhost:${port}`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Internal Tools API',
      version: '1.0.0',
      description: 'API for managing internal tools',
    },
    servers: [{ url: apiUrl }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: `Server running on ${apiUrl}` });
});

app.use('/api/tools', toolRoutes);
app.use('/api/analytics', analyticRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on ${apiUrl}`);
});
