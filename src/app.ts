import express from 'express';
import authRoutes from './routes/auth.routes';
import fixtureRoutes from './routes/fixture.routes';
import teamRoutes from './routes/team.routes';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
dotenv.config();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			error: 'Too many requests, please try again later.'
		});
	},
	validate: false
});

//Rate Limit For User Routes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 15, 
	message: 'Too many login attempts, please try again later.'
});

const app = express();

// Middleware
app.use(express.json());
app.use(limiter); 
app.use(cors());
app.set('trust proxy', true);


// Apply Rate Limit For User Routes
app.use('/api/v1/auth', authLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/fixtures', fixtureRoutes);
app.use('/api/v1/teams', teamRoutes);

export default app;
