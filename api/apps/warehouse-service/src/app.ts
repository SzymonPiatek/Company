import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.route';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/warehouse', apiRoutes);

export default app;
